import type { NextApiRequest } from 'next'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: NextApiRequest) => string // Custom key generation
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

export class RateLimiter {
  private storage = new Map<string, RateLimitEntry>()
  private configs: Record<string, RateLimitConfig> = {}

  constructor() {
    // Set up default configurations
    this.configs = {
      generate: {
        windowMs:
          parseInt(process.env.RATE_LIMIT_GUEST_GENERATE_WINDOW_HOURS || '24') *
          60 *
          60 *
          1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_GUEST_GENERATE_MAX || '2'),
      },
      edit: {
        windowMs:
          parseInt(process.env.RATE_LIMIT_GUEST_EDIT_WINDOW_HOURS || '24') *
          60 *
          60 *
          1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_GUEST_EDIT_MAX || '3'),
      },
      authenticated: {
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        maxRequests: parseInt(
          process.env.RATE_LIMIT_AUTHENTICATED_GENERATE_MAX || '5'
        ),
      },
    }

    // Clean up expired entries every hour
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 60 * 60 * 1000)
  }

  /**
   * Extract client IP address from request, handling proxy headers
   */
  private getClientIP(req: NextApiRequest): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    )
  }

  /**
   * Generate rate limit key for storage
   */
  private generateKey(
    ip: string,
    endpoint: string,
    articleId?: string,
    userId?: string
  ): string {
    // For authenticated users, use userId instead of IP
    if (endpoint === 'authenticated' && userId) {
      return `user:${userId}:${endpoint}`
    }
    // For edit endpoint, include articleId to limit per article
    if (endpoint === 'edit' && articleId) {
      return `${ip}:${endpoint}:${articleId}`
    }
    return `${ip}:${endpoint}`
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now()
    const entries = Array.from(this.storage.entries())
    for (const [key, entry] of entries) {
      if (entry.resetTime <= now) {
        this.storage.delete(key)
      }
    }
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(
    req: NextApiRequest,
    endpoint: string,
    articleId?: string,
    userId?: string
  ): RateLimitResult {
    const ip = this.getClientIP(req)
    const config = this.configs[endpoint]

    if (!config) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now(),
        error: 'Invalid endpoint configuration',
      }
    }

    const key = this.generateKey(ip, endpoint, articleId, userId)
    const now = Date.now()
    const resetTime = now + config.windowMs

    // Get or create entry
    let entry = this.storage.get(key)

    if (!entry || entry.resetTime <= now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime,
      }
      this.storage.set(key, entry)

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      }
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        error: 'Rate limit exceeded',
      }
    }

    // Increment count
    entry.count++
    this.storage.set(key, entry)

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Reset rate limits for a specific IP and endpoint
   */
  resetLimits(ip: string, endpoint?: string): void {
    if (endpoint) {
      // Reset specific endpoint for IP
      const keys = Array.from(this.storage.keys()).filter((key) =>
        key.startsWith(`${ip}:${endpoint}`)
      )
      keys.forEach((key) => this.storage.delete(key))
    } else {
      // Reset all limits for IP
      const keys = Array.from(this.storage.keys()).filter((key) =>
        key.startsWith(`${ip}:`)
      )
      keys.forEach((key) => this.storage.delete(key))
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  getStatus(
    req: NextApiRequest,
    endpoint: string,
    articleId?: string,
    userId?: string
  ): RateLimitResult {
    const ip = this.getClientIP(req)
    const config = this.configs[endpoint]

    if (!config) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now(),
        error: 'Invalid endpoint configuration',
      }
    }

    const key = this.generateKey(ip, endpoint, articleId, userId)
    const now = Date.now()
    const entry = this.storage.get(key)

    if (!entry || entry.resetTime <= now) {
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      }
    }

    return {
      allowed: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()
