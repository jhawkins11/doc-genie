import type { NextApiRequest } from 'next'
import { RateLimiter } from '../rateLimiter'

// Mock the database connection and model
jest.mock('@/utils/connectToDb', () => jest.fn().mockResolvedValue(undefined))
jest.mock('@/models/RateLimitModel', () => ({
  RateLimitModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  },
}))

// Mock date-fns-tz functions
jest.mock('date-fns-tz', () => ({
  toZonedTime: jest.fn((date) => date),
  fromZonedTime: jest.fn((date) => date),
}))

import { RateLimitModel } from '@/models/RateLimitModel'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
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
    it('should extract IP from x-forwarded-for header', async () => {
      const req = createMockRequest('203.0.113.1')

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })

    it('should handle multiple IPs in x-forwarded-for header', async () => {
      const req = createMockRequest('203.0.113.1, 198.51.100.1, 192.0.2.1')

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })

    it('should fallback to x-real-ip header', async () => {
      const req = createMockRequest(undefined, { 'x-real-ip': '203.0.113.2' })
      delete req.headers['x-forwarded-for']
      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })

    it('should fallback to connection.remoteAddress', async () => {
      const req = createMockRequest()
      delete req.headers['x-forwarded-for']
      delete req.headers['x-real-ip']
      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
    })
  })

  describe('Rate limiting for generate endpoint', () => {
    it('should allow first request when no existing entry', async () => {
      const req = createMockRequest('192.168.1.1')

      // Mock no existing entry
      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({
        key: '192.168.1.1:generate',
        count: 1,
        resetTime: new Date(),
      })

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)
      expect(RateLimitModel.create).toHaveBeenCalledWith({
        key: '192.168.1.1:generate',
        count: 1,
        resetTime: expect.any(Date),
      })
    })

    it('should increment count for existing entry within limit', async () => {
      const req = createMockRequest('192.168.1.2')

      const mockEntry = {
        key: '192.168.1.2:generate',
        count: 1,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: jest.fn().mockResolvedValue(undefined),
      }

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(mockEntry)

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
      expect(mockEntry.count).toBe(2)
      expect(mockEntry.save).toHaveBeenCalled()
    })

    it('should block requests when limit exceeded', async () => {
      const req = createMockRequest('192.168.1.3')

      const mockEntry = {
        key: '192.168.1.3:generate',
        count: 2, // Already at limit
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        save: jest.fn(),
      }

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(mockEntry)

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.error).toBe('Rate limit exceeded')
      expect(mockEntry.save).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const req = createMockRequest('192.168.1.4')

      ;(RateLimitModel.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true) // Fail open
      expect(result.error).toBe('Rate limiter error')
    })
  })

  describe('Rate limiting for authenticated users', () => {
    it('should use userId for authenticated users', async () => {
      const req = createMockRequest('192.168.1.5')
      const userId = 'user123'

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      await rateLimiter.checkLimit(req, 'authenticated', undefined, userId)

      expect(RateLimitModel.findOne).toHaveBeenCalledWith({
        key: 'user:user123:authenticated',
        resetTime: { $gt: expect.any(Date) },
      })
    })
  })

  describe('Rate limiting for edit endpoint', () => {
    it('should include articleId in key for edit endpoint', async () => {
      const req = createMockRequest('192.168.1.6')
      const articleId = 'article123'

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      await rateLimiter.checkLimit(req, 'edit', articleId)

      expect(RateLimitModel.findOne).toHaveBeenCalledWith({
        key: '192.168.1.6:edit:article123',
        resetTime: { $gt: expect.any(Date) },
      })
    })
  })

  describe('Reset functionality', () => {
    it('should reset limits for specific endpoint', async () => {
      await rateLimiter.resetLimits('192.168.1.7', 'generate')

      expect(RateLimitModel.deleteMany).toHaveBeenCalledWith({
        key: { $regex: '^192.168.1.7:generate' },
      })
    })

    it('should reset all limits for IP when no endpoint specified', async () => {
      await rateLimiter.resetLimits('192.168.1.8')

      expect(RateLimitModel.deleteMany).toHaveBeenCalledWith({
        key: { $regex: '^192.168.1.8:' },
      })
    })
  })

  describe('Status checking', () => {
    it('should return status without incrementing count', async () => {
      const req = createMockRequest('192.168.1.9')

      const mockEntry = {
        key: '192.168.1.9:generate',
        count: 1,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(mockEntry)

      const result = await rateLimiter.getStatus(req, 'generate')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(1)

      // Should not create or save anything
      expect(RateLimitModel.create).not.toHaveBeenCalled()
    })
  })

  describe('Timezone functionality', () => {
    it('should use UTC timezone by default', async () => {
      const req = createMockRequest('192.168.1.11')

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      const result = await rateLimiter.checkLimit(req, 'generate')
      expect(result.allowed).toBe(true)

      // Should use default UTC timezone
      expect(toZonedTime).toHaveBeenCalledWith(expect.any(Date), 'UTC')
      expect(fromZonedTime).toHaveBeenCalledWith(expect.any(Date), 'UTC')
    })

    it('should use provided timezone for reset time calculation', async () => {
      const req = createMockRequest('192.168.1.12')
      const timezone = 'America/New_York'

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(RateLimitModel.create as jest.Mock).mockResolvedValue({})

      const result = await rateLimiter.checkLimit(
        req,
        'generate',
        undefined,
        undefined,
        timezone
      )
      expect(result.allowed).toBe(true)

      // Should use provided timezone
      expect(toZonedTime).toHaveBeenCalledWith(expect.any(Date), timezone)
      expect(fromZonedTime).toHaveBeenCalledWith(expect.any(Date), timezone)
    })

    it('should use timezone in getStatus method', async () => {
      const req = createMockRequest('192.168.1.13')
      const timezone = 'Europe/London'

      ;(RateLimitModel.findOne as jest.Mock).mockResolvedValue(null)

      const result = await rateLimiter.getStatus(
        req,
        'generate',
        undefined,
        undefined,
        timezone
      )
      expect(result.allowed).toBe(true)

      // Should use provided timezone
      expect(toZonedTime).toHaveBeenCalledWith(expect.any(Date), timezone)
      expect(fromZonedTime).toHaveBeenCalledWith(expect.any(Date), timezone)
    })
  })

  describe('Invalid configuration', () => {
    it('should handle invalid endpoint', async () => {
      const req = createMockRequest('192.168.1.10')

      const result = await rateLimiter.checkLimit(req, 'invalid-endpoint')
      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Invalid endpoint configuration')
    })
  })
})
