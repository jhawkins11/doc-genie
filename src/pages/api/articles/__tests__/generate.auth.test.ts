import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '../generate'
import { ArticleModel } from '@/models/ArticleModel'
import { generateAIArticle } from '@/utils/generateAIArticle'
import connectToDb from '@/utils/connectToDb'
import createUniqueSlug from '@/utils/createUniqueSlug'
import { rateLimiter } from '@/lib/backend/rateLimiter'
import { verifyOptionalAuthentication } from '@/lib/backend/authService'

// Mock dependencies
jest.mock('@/models/ArticleModel')
jest.mock('@/utils/generateAIArticle')
jest.mock('@/utils/connectToDb')
jest.mock('@/utils/createUniqueSlug')
jest.mock('@/lib/backend/rateLimiter')
jest.mock('@/lib/backend/authService')

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

describe('/api/articles/generate - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectToDb.mockResolvedValue(undefined)
    mockCreateUniqueSlug.mockResolvedValue('test-slug')
    mockGenerateAIArticle.mockResolvedValue(
      '# Test Article\n\n## Section 1\n\nContent here.'
    )
  })

  describe('Guest User Authentication', () => {
    it('should generate article for guest user without authentication', async () => {
      // Mock authentication service for guest user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      // Mock rate limiter to allow request for guest
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-id',
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
      expect(responseData).toMatchObject({
        title: 'Test Article',
        isGuest: true,
      })
      // uid should not be present for guest users
      expect(responseData.uid).toBeUndefined()

      expect(mockVerifyOptionalAuthentication).toHaveBeenCalledWith(req)
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'generate',
        undefined,
        undefined,
        undefined
      )
      expect(mockArticleModel.create).toHaveBeenCalledWith({
        parentid: '',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: undefined,
        isGuest: true,
      })
    })

    it('should apply rate limiting for guest users', async () => {
      // Mock authentication service for guest user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      // Mock rate limiter to block request
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 86400000,
        error: 'Rate limit exceeded',
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(429)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'rate_limit_exceeded',
        message:
          'Too many requests from this IP. Guest users are limited to 2 article generations per day.',
      })

      expect(mockVerifyOptionalAuthentication).toHaveBeenCalledWith(req)
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'generate',
        undefined,
        undefined,
        undefined
      )
      expect(mockArticleModel.create).not.toHaveBeenCalled()
    })
  })

  describe('Authenticated User Authentication', () => {
    it('should generate article for authenticated user with valid token', async () => {
      // Mock authentication service for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: {
          uid: 'user-123',
          email: 'test@example.com',
        },
      })

      // Mock rate limiter to allow request for authenticated user
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-id',
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
          authorization: 'Bearer valid-token-123',
        },
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject({
        title: 'Test Article',
        isGuest: false,
        uid: 'user-123',
      })

      expect(mockVerifyOptionalAuthentication).toHaveBeenCalledWith(req)
      // Authenticated users have rate limiting with different limits
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'authenticated',
        undefined,
        'user-123',
        undefined
      )
      expect(mockArticleModel.create).toHaveBeenCalledWith({
        parentid: '',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nContent here.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
      })
    })

    it('should apply rate limiting to authenticated users with higher limits', async () => {
      // Mock authentication service for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: {
          uid: 'user-123',
          email: 'test@example.com',
        },
      })

      // Mock rate limiter to block authenticated user (rate limit exceeded)
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 86400000,
        error: 'Rate limit exceeded',
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token-123',
        },
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(429)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'rate_limit_exceeded',
        message:
          'Too many requests. Authenticated users are limited to 5 article generations per day.',
      })

      expect(mockVerifyOptionalAuthentication).toHaveBeenCalledWith(req)
      // Rate limiter should be called for authenticated users with their uid
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'authenticated',
        undefined,
        'user-123',
        undefined
      )
    })
  })

  describe('Authentication Error Handling', () => {
    it('should handle authentication service errors gracefully', async () => {
      // Mock authentication service to throw error
      const authError = new Error('Firebase service unavailable')
      mockVerifyOptionalAuthentication.mockRejectedValue(authError)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-token',
        },
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

      expect(mockVerifyOptionalAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.create).not.toHaveBeenCalled()
    })

    it('should treat invalid tokens as guest users in optional authentication', async () => {
      // Mock authentication service to return guest for invalid token
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      // Mock rate limiter to allow request
      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 1,
        resetTime: Date.now() + 86400000,
      })

      const mockCreatedArticle = {
        _id: 'mock-id',
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
          authorization: 'Bearer invalid-token',
        },
        body: {
          topic: 'Test Topic',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toMatchObject({
        isGuest: true,
      })
      // uid should not be present for guest users
      expect(responseData.uid).toBeUndefined()

      expect(mockVerifyOptionalAuthentication).toHaveBeenCalledWith(req)
      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'generate',
        undefined,
        undefined,
        undefined
      )
    })
  })

  describe('Request Validation with Authentication', () => {
    it('should validate request body regardless of authentication status', async () => {
      // Mock authentication service for guest user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          // Missing required topic field
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'invalid_request',
        message: 'Invalid request body. Please check your input.',
      })

      // Authentication should not be called if validation fails first
      expect(mockVerifyOptionalAuthentication).not.toHaveBeenCalled()
    })
  })
})
