import type { NextApiRequest } from 'next'
import { RateLimitModel } from '@/models/RateLimitModel'
import connectToDb from '@/utils/connectToDb'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

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

export class RateLimiter {
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

  private _getResetTime(timezone = 'UTC'): Date {
    // Get the current time in the specified timezone
    const now = new Date()
    const zonedNow = toZonedTime(now, timezone)

    // Get the start of the next day in the specified timezone
    const nextDay = new Date(zonedNow)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0)

    // Convert the start of the next day back to a UTC date
    const resetTime = fromZonedTime(nextDay, timezone)
    return resetTime
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(
    req: NextApiRequest,
    endpoint: string,
    articleId?: string,
    userId?: string,
    timezone?: string
  ): Promise<RateLimitResult> {
    try {
      await connectToDb()

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
      const now = new Date()

      // Calculate reset time as the next midnight in the user's timezone (or UTC)
      const resetTime = this._getResetTime(timezone)

      // Try to find existing rate limit entry
      const existingEntry = await RateLimitModel.findOne({
        key,
        resetTime: { $gt: now }, // Only get non-expired entries
      })

      if (!existingEntry) {
        // Create new entry
        await RateLimitModel.create({
          key,
          count: 1,
          resetTime,
        })

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: resetTime.getTime(),
        }
      }

      // Check if limit exceeded
      if (existingEntry.count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: existingEntry.resetTime.getTime(),
          error: 'Rate limit exceeded',
        }
      }

      // Increment count
      existingEntry.count++
      await existingEntry.save()

      return {
        allowed: true,
        remaining: config.maxRequests - existingEntry.count,
        resetTime: existingEntry.resetTime.getTime(),
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open - allow request if database error occurs
      return {
        allowed: true,
        remaining: 0,
        resetTime: Date.now(),
        error: 'Rate limiter error',
      }
    }
  }

  /**
   * Reset rate limits for a specific IP and endpoint
   */
  async resetLimits(ip: string, endpoint?: string): Promise<void> {
    try {
      await connectToDb()

      if (endpoint) {
        // Reset specific endpoint for IP
        await RateLimitModel.deleteMany({
          key: { $regex: `^${ip}:${endpoint}` },
        })
      } else {
        // Reset all limits for IP
        await RateLimitModel.deleteMany({
          key: { $regex: `^${ip}:` },
        })
      }
    } catch (error) {
      console.error('Error resetting rate limits:', error)
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(
    req: NextApiRequest,
    endpoint: string,
    articleId?: string,
    userId?: string,
    timezone?: string
  ): Promise<RateLimitResult> {
    try {
      await connectToDb()

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
      const now = new Date()

      const existingEntry = await RateLimitModel.findOne({
        key,
        resetTime: { $gt: now },
      })

      if (!existingEntry) {
        // Calculate reset time as the next midnight in the user's timezone (or UTC)
        const resetTime = this._getResetTime(timezone)

        return {
          allowed: true,
          remaining: config.maxRequests,
          resetTime: resetTime.getTime(),
        }
      }

      const remaining = Math.max(0, config.maxRequests - existingEntry.count)

      return {
        allowed: remaining > 0,
        remaining,
        resetTime: existingEntry.resetTime.getTime(),
      }
    } catch (error) {
      console.error('Error getting rate limit status:', error)
      return {
        allowed: true,
        remaining: 0,
        resetTime: Date.now(),
        error: 'Rate limiter error',
      }
    }
  }

  /**
   * Clean up expired entries (optional - TTL index handles this automatically)
   */
  async cleanupExpiredEntries(): Promise<void> {
    try {
      await connectToDb()
      const now = new Date()
      await RateLimitModel.deleteMany({
        resetTime: { $lte: now },
      })
    } catch (error) {
      console.error('Error cleaning up expired rate limit entries:', error)
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()
