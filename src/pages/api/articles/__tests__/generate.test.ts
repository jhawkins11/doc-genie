import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '../generate'
import { ArticleModel } from '@/models/ArticleModel'
import { generateAIArticle } from '@/utils/generateAIArticle'
import connectToDb from '@/utils/connectToDb'
import createUniqueSlug from '@/utils/createUniqueSlug'
import { rateLimiter } from '@/lib/backend/rateLimiter'

// Mock dependencies
jest.mock('@/models/ArticleModel')
jest.mock('@/utils/generateAIArticle')
jest.mock('@/utils/connectToDb')
jest.mock('@/utils/createUniqueSlug')
jest.mock('@/lib/backend/rateLimiter')
jest.mock('@/lib/backend/authService')

import { verifyOptionalAuthentication } from '@/lib/backend/authService'

const mockArticleModel = ArticleModel as jest.Mocked<typeof ArticleModel>
const mockGenerateAIArticle = generateAIArticle as jest.MockedFunction<
  typeof generateAIArticle
>
const mockConnectToDb = connectToDb as jest.MockedFunction<typeof connectToDb>
const mockCreateUniqueSlug = createUniqueSlug as jest.MockedFunction<
  typeof createUniqueSlug
>
const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>
const mockVerifyOptionalAuthentication =
  verifyOptionalAuthentication as jest.MockedFunction<
    typeof verifyOptionalAuthentication
  >

describe('/api/articles/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectToDb.mockResolvedValue(undefined)
    mockCreateUniqueSlug.mockResolvedValue('test-slug')
    mockGenerateAIArticle.mockResolvedValue(
      '# Test Article\n\n## Section 1\n\nContent here.'
    )

    // Default mock for guest authentication
    mockVerifyOptionalAuthentication.mockResolvedValue({
      isAuthenticated: false,
      isGuest: true,
      user: null,
    })
  })

  describe('Guest Article Generation', () => {
    it('should generate article for guest user (no auth header)', async () => {
      // Mock rate limiter to allow request
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-id' as unknown,
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: undefined as string | undefined,
        isGuest: true,
        parentid: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject({
        title: 'Test Article',
        isGuest: true,
      })

      expect(mockArticleModel.create).toHaveBeenCalledWith({
        parentid: '',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: undefined,
        isGuest: true,
      })
    })

    it('should generate subarticle for guest user', async () => {
      // Mock rate limiter to allow request
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-child-id' as unknown,
        title: 'Test Subtopic',
        content: '# Test Subtopic\n\n## Section 1\n\nContent here.',
        slug: 'test-subtopic-slug',
        uid: undefined as string | undefined,
        isGuest: true,
        parentid: 'parent-id',
      }

      const mockPopulateResult = {
        childArticles: [] as unknown[],
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )
      mockArticleModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPopulateResult),
      } as unknown as ReturnType<typeof ArticleModel.findById>)
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(
        {} as unknown as ReturnType<typeof ArticleModel.findByIdAndUpdate>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: 'Test Topic',
          subtopic: 'Test Subtopic',
          parentid: 'parent-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(mockArticleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'parent-id',
        {
          $push: { childArticles: 'mock-child-id' },
        }
      )
    })
  })

  describe('Authenticated Article Generation', () => {
    it('should generate article for authenticated user', async () => {
      // Mock rate limiter to allow request
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 86400000,
      })

      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      const mockCreatedArticle = {
        _id: 'mock-id' as unknown,
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
        parentid: '',
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          topic: 'Test Topic',
          uid: 'user-123',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject({
        title: 'Test Article',
        isGuest: false,
        uid: 'user-123',
      })

      expect(mockArticleModel.create).toHaveBeenCalledWith({
        parentid: '',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
      })
    })
  })

  describe('Request Validation', () => {
    it('should return 400 for missing topic', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {},
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'invalid_request',
        message: 'Invalid request body. Please check your input.',
      })
    })

    it('should return 400 for empty topic', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: '',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'invalid_request',
        message: 'Invalid request body. Please check your input.',
      })
    })

    it('should return 405 for non-POST methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'method_not_allowed',
        message: 'Only POST method is allowed',
      })
    })
  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Reset rate limiter mock
      mockRateLimiter.checkLimit.mockClear()
    })

    it('should apply rate limiting to guest users', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-id' as unknown,
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: undefined as string | undefined,
        isGuest: true,
        parentid: '',
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'generate',
        undefined,
        undefined
      )
      expect(res._getStatusCode()).toBe(201)
    })

    it('should block guest users when rate limit exceeded', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 86400000,
        error: 'Rate limit exceeded',
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'generate',
        undefined,
        undefined
      )
      expect(res._getStatusCode()).toBe(429)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'rate_limit_exceeded',
        message:
          'Too many requests from this IP. Guest users are limited to 2 article generations per day.',
      })
    })

    it('should apply rate limiting to authenticated users', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 86400000,
      })

      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      const mockCreatedArticle = {
        _id: 'mock-id' as unknown,
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
        parentid: '',
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          topic: 'Test Topic',
          uid: 'user-123',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'authenticated',
        undefined,
        'user-123'
      )
      expect(res._getStatusCode()).toBe(201)
    })

    it('should block authenticated users when rate limit exceeded', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 86400000,
        error: 'Rate limit exceeded',
      })

      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          topic: 'Test Topic',
          uid: 'user-123',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'authenticated',
        undefined,
        'user-123'
      )
      expect(res._getStatusCode()).toBe(429)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'rate_limit_exceeded',
        message:
          'Too many requests. Authenticated users are limited to 5 article generations per day.',
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 400 when AI generation fails', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      mockGenerateAIArticle.mockResolvedValue('')

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'generation_failed',
        message: 'Failed to generate article content. Please try again.',
      })
    })

    it('should return 500 when database error occurs', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.create.mockRejectedValue(new Error('Database error'))

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'internal_server_error',
        message: 'An unexpected error occurred. Please try again later.',
      })
    })
  })

  describe('Response Schema', () => {
    it('should return proper response schema for guest articles', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-id' as unknown,
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: undefined as string | undefined,
        isGuest: true,
        parentid: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)

      const responseData = JSON.parse(res._getData())
      expect(responseData).toHaveProperty('title')
      expect(responseData).toHaveProperty('content')
      expect(responseData).toHaveProperty('slug')
      expect(responseData).toHaveProperty('isGuest')
      expect(responseData.isGuest).toBe(true)
      expect(responseData.uid).toBeUndefined()
    })

    it('should return proper response schema for authenticated articles', async () => {
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 86400000,
      })

      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      const mockCreatedArticle = {
        _id: 'mock-id' as unknown,
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
        parentid: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockArticleModel.create.mockResolvedValue(
        mockCreatedArticle as unknown as ReturnType<typeof ArticleModel.create>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          topic: 'Test Topic',
          uid: 'user-123',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)

      const responseData = JSON.parse(res._getData())
      expect(responseData).toHaveProperty('title')
      expect(responseData).toHaveProperty('content')
      expect(responseData).toHaveProperty('slug')
      expect(responseData).toHaveProperty('isGuest')
      expect(responseData).toHaveProperty('uid')
      expect(responseData.isGuest).toBe(false)
      expect(responseData.uid).toBe('user-123')
    })
  })
})
