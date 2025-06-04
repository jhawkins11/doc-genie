import type { NextApiRequest } from 'next'
import { RateLimiter } from '../rateLimiter'

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  jest.resetModules()
  process.env = {
    ...originalEnv,
    RATE_LIMIT_GUEST_GENERATE_MAX: '2',
    RATE_LIMIT_GUEST_GENERATE_WINDOW_HOURS: '24',
    RATE_LIMIT_GUEST_EDIT_MAX: '3',
    RATE_LIMIT_GUEST_EDIT_WINDOW_HOURS: '24',
  }
})

afterEach(() => {
  process.env = originalEnv
})

// Helper function to create mock request
const createMockRequest = (
  ip?: string,
  headers?: Record<string, string>
): NextApiRequest => {
  return {
    headers: {
      'x-forwarded-for': ip || '192.168.1.1',
      ...headers,
    },
    connection: {
      remoteAddress: '127.0.0.1',
    },
    socket: {
      remoteAddress: '127.0.0.1',
    },
  } as unknown as NextApiRequest
}

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter()
  })

  describe('IP extraction', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const req = createMockRequest('203.0.113.1')
      const result = rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })

    it('should handle multiple IPs in x-forwarded-for header', () => {
      const req = createMockRequest('203.0.113.1, 198.51.100.1, 192.0.2.1')
      const result = rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })

    it('should fallback to x-real-ip header', () => {
      const req = createMockRequest(undefined, { 'x-real-ip': '203.0.113.2' })
      delete req.headers['x-forwarded-for']
      const result = rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })

    it('should fallback to connection.remoteAddress', () => {
      const req = createMockRequest()
      delete req.headers['x-forwarded-for']
      delete req.headers['x-real-ip']
      const result = rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })
  })

  describe('Rate limiting for generate endpoint', () => {
    it('should allow requests within limit', () => {
      const req = createMockRequest('192.168.1.1')

      const result1 = rateLimiter.checkLimit(req, 'generate')
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(1)

      const result2 = rateLimiter.checkLimit(req, 'generate')
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(0)
    })

    it('should block requests exceeding limit', () => {
      const req = createMockRequest('192.168.1.2')

      // Use up the limit
      rateLimiter.checkLimit(req, 'generate')
      rateLimiter.checkLimit(req, 'generate')

      // This should be blocked
      const result = rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.error).toBe('Rate limit exceeded')
    })

    it('should track different IPs separately', () => {
      const req1 = createMockRequest('192.168.1.3')
      const req2 = createMockRequest('192.168.1.4')

      // Use up limit for first IP
      rateLimiter.checkLimit(req1, 'generate')
      rateLimiter.checkLimit(req1, 'generate')
      const blocked = rateLimiter.checkLimit(req1, 'generate')
      expect(blocked.allowed).toBe(false)

      // Second IP should still be allowed
      const allowed = rateLimiter.checkLimit(req2, 'generate')
      expect(allowed.allowed).toBe(true)
    })
  })

  describe('Rate limiting for edit endpoint', () => {
    it('should allow requests within limit per article', () => {
      const req = createMockRequest('192.168.1.5')
      const articleId = 'article123'

      const result1 = rateLimiter.checkLimit(req, 'edit', articleId)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = rateLimiter.checkLimit(req, 'edit', articleId)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(1)

      const result3 = rateLimiter.checkLimit(req, 'edit', articleId)
      expect(result3.allowed).toBe(true)
      expect(result3.remaining).toBe(0)
    })

    it('should block requests exceeding limit per article', () => {
      const req = createMockRequest('192.168.1.6')
      const articleId = 'article456'

      // Use up the limit
      rateLimiter.checkLimit(req, 'edit', articleId)
      rateLimiter.checkLimit(req, 'edit', articleId)
      rateLimiter.checkLimit(req, 'edit', articleId)

      // This should be blocked
      const result = rateLimiter.checkLimit(req, 'edit', articleId)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.error).toBe('Rate limit exceeded')
    })

    it('should track different articles separately for same IP', () => {
      const req = createMockRequest('192.168.1.7')
      const articleId1 = 'article789'
      const articleId2 = 'article101'

      // Use up limit for first article
      rateLimiter.checkLimit(req, 'edit', articleId1)
      rateLimiter.checkLimit(req, 'edit', articleId1)
      rateLimiter.checkLimit(req, 'edit', articleId1)
      const blocked = rateLimiter.checkLimit(req, 'edit', articleId1)
      expect(blocked.allowed).toBe(false)

      // Second article should still be allowed
      const allowed = rateLimiter.checkLimit(req, 'edit', articleId2)
      expect(allowed.allowed).toBe(true)
    })
  })

  describe('Rate limit reset functionality', () => {
    it('should reset limits for specific IP and endpoint', () => {
      const req = createMockRequest('192.168.1.8')

      // Use up the limit
      rateLimiter.checkLimit(req, 'generate')
      rateLimiter.checkLimit(req, 'generate')
      const blocked = rateLimiter.checkLimit(req, 'generate')
      expect(blocked.allowed).toBe(false)

      // Reset limits
      rateLimiter.resetLimits('192.168.1.8', 'generate')

      // Should be allowed again
      const allowed = rateLimiter.checkLimit(req, 'generate')
      expect(allowed.allowed).toBe(true)
    })

    it('should reset all limits for IP when no endpoint specified', () => {
      const req = createMockRequest('192.168.1.9')

      // Use up limits for both endpoints
      rateLimiter.checkLimit(req, 'generate')
      rateLimiter.checkLimit(req, 'generate')
      rateLimiter.checkLimit(req, 'edit', 'article123')
      rateLimiter.checkLimit(req, 'edit', 'article123')
      rateLimiter.checkLimit(req, 'edit', 'article123')

      // Both should be blocked
      expect(rateLimiter.checkLimit(req, 'generate').allowed).toBe(false)
      expect(rateLimiter.checkLimit(req, 'edit', 'article123').allowed).toBe(
        false
      )

      // Reset all limits for IP
      rateLimiter.resetLimits('192.168.1.9')

      // Both should be allowed again
      expect(rateLimiter.checkLimit(req, 'generate').allowed).toBe(true)
      expect(rateLimiter.checkLimit(req, 'edit', 'article123').allowed).toBe(
        true
      )
    })
  })

  describe('Status checking without incrementing', () => {
    it('should return status without incrementing count', () => {
      const req = createMockRequest('192.168.1.10')

      // Check status - should not increment
      const status1 = rateLimiter.getStatus(req, 'generate')
      expect(status1.allowed).toBe(true)
      expect(status1.remaining).toBe(2)

      // Check again - should be the same
      const status2 = rateLimiter.getStatus(req, 'generate')
      expect(status2.allowed).toBe(true)
      expect(status2.remaining).toBe(2)

      // Now actually use the limit
      const result = rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)

      // Status should reflect the change
      const status3 = rateLimiter.getStatus(req, 'generate')
      expect(status3.allowed).toBe(true)
      expect(status3.remaining).toBe(1)
    })
  })

  describe('Invalid endpoint configuration', () => {
    it('should handle invalid endpoint gracefully', () => {
      const req = createMockRequest('192.168.1.11')

      const result = rateLimiter.checkLimit(req, 'invalid_endpoint')
      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Invalid endpoint configuration')
    })
  })

  describe('Time window behavior', () => {
    it('should reset count after time window expires', (done) => {
      // Create a rate limiter with very short window for testing
      const testRateLimiter = new RateLimiter()
      // Override the config for testing
      testRateLimiter['configs'] = {
        generate: {
          windowMs: 100, // 100ms window
          maxRequests: 1,
        },
        edit: {
          windowMs: 100,
          maxRequests: 1,
        },
      }

      const req = createMockRequest('192.168.1.12')

      // Use up the limit
      const result1 = testRateLimiter.checkLimit(req, 'generate')
      expect(result1.allowed).toBe(true)

      // Should be blocked immediately
      const result2 = testRateLimiter.checkLimit(req, 'generate')
      expect(result2.allowed).toBe(false)

      // Wait for window to expire
      setTimeout(() => {
        const result3 = testRateLimiter.checkLimit(req, 'generate')
        expect(result3.allowed).toBe(true)
        done()
      }, 150)
    })
  })
})
