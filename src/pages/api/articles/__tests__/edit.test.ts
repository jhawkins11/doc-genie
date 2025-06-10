import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '../edit'
import { ArticleModel } from '@/models/ArticleModel'
import { generateAIArticle } from '@/utils/generateAIArticle'
import connectToDb from '@/utils/connectToDb'
import { rateLimiter } from '@/lib/backend/rateLimiter'
import { verifyOptionalAuthentication } from '@/lib/backend/authService'

// Mock dependencies
jest.mock('@/models/ArticleModel')
jest.mock('@/utils/generateAIArticle')
jest.mock('@/utils/connectToDb')
jest.mock('@/lib/backend/rateLimiter')
jest.mock('@/lib/backend/authService')

const mockArticleModel = ArticleModel as jest.Mocked<typeof ArticleModel>
const mockGenerateAIArticle = generateAIArticle as jest.MockedFunction<
  typeof generateAIArticle
>
const mockConnectToDb = connectToDb as jest.MockedFunction<typeof connectToDb>
const mockRateLimiter = rateLimiter as jest.Mocked<typeof rateLimiter>
const mockVerifyOptionalAuthentication =
  verifyOptionalAuthentication as jest.MockedFunction<
    typeof verifyOptionalAuthentication
  >

describe('/api/articles/edit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectToDb.mockResolvedValue(undefined)
    mockGenerateAIArticle.mockResolvedValue(
      '# Test Article\n\n## Section 1\n\nEdited content here.'
    )
  })

  describe('Guest Article Editing', () => {
    it('should edit article for guest user (no auth header)', async () => {
      // Mock guest authentication
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      const mockExistingArticle = {
        _id: 'article-123',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nOriginal content.',
        slug: 'test-slug',
        uid: null as string | null, // Guest article
        isGuest: true,
      }

      const mockEditedArticle = {
        _id: 'article-123',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nEdited content here.',
        slug: 'test-slug',
        isGuest: true,
      }

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValue(
        mockExistingArticle as unknown as ReturnType<
          typeof ArticleModel.findById
        >
      )
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(
        mockEditedArticle as unknown as ReturnType<
          typeof ArticleModel.findByIdAndUpdate
        >
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          _id: 'article-123',
          editPrompt: 'Make it more detailed',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'edit',
        'article-123',
        undefined,
        undefined
      )
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toMatchObject({
        _id: 'article-123',
        content: '# Test Article\n\n## Section 1\n\nEdited content here.',
      })
    })

    it('should block guest users when rate limit exceeded', async () => {
      // Mock guest authentication
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

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
          _id: 'article-123',
          editPrompt: 'Make it more detailed',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'edit',
        'article-123',
        undefined,
        undefined
      )
      expect(res._getStatusCode()).toBe(429)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'rate_limit_exceeded',
        message:
          'Too many edit requests. Guest users are limited to 3 article edits per day.',
      })
    })
  })

  describe('Authenticated Article Editing', () => {
    it('should edit article for authenticated user', async () => {
      // Mock authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      const mockExistingArticle = {
        _id: 'article-123',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nOriginal content.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
      }

      const mockEditedArticle = {
        _id: 'article-123',
        title: 'Test Article',
        content: '# Test Article\n\n## Section 1\n\nEdited content here.',
        slug: 'test-slug',
        uid: 'user-123',
        isGuest: false,
      }

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValue(
        mockExistingArticle as unknown as ReturnType<
          typeof ArticleModel.findById
        >
      )
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(
        mockEditedArticle as unknown as ReturnType<
          typeof ArticleModel.findByIdAndUpdate
        >
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          _id: 'article-123',
          editPrompt: 'Make it more detailed',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'authenticated',
        'article-123',
        'user-123',
        undefined
      )
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toMatchObject({
        _id: 'article-123',
        uid: 'user-123',
        isGuest: false,
      })
    })

    it('should block authenticated users when rate limit exceeded', async () => {
      // Mock authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 86400000,
        error: 'Rate limit exceeded',
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          _id: 'article-123',
          editPrompt: 'Make it more detailed',
        },
      })

      await handler(req, res)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req,
        'authenticated',
        'article-123',
        'user-123',
        undefined
      )
      expect(res._getStatusCode()).toBe(429)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'rate_limit_exceeded',
        message:
          'Too many requests. Authenticated users are limited to 5 operations per day.',
      })
    })
  })

  describe('Request Validation', () => {
    it('should return 400 for missing edit prompt', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          _id: 'article-123',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'invalid_request',
        message: 'Invalid request body. Please check your input.',
      })
    })

    it('should return 400 for missing article ID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          editPrompt: 'Make it better',
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

  describe('Error Handling', () => {
    it('should return 404 when article not found', async () => {
      // Mock guest authentication
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValue(null)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          _id: 'nonexistent-article',
          editPrompt: 'Make it better',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'article_not_found',
        message: 'Article not found.',
      })
    })

    it('should return 400 when AI editing fails', async () => {
      // Mock guest authentication
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      const mockExistingArticle = {
        _id: 'article-123',
        content: 'Original content',
        uid: null as string | null,
      }

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValue(
        mockExistingArticle as unknown as ReturnType<
          typeof ArticleModel.findById
        >
      )
      mockGenerateAIArticle.mockResolvedValue('')

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          _id: 'article-123',
          editPrompt: 'Make it better',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'edit_failed',
        message: 'Failed to edit article content. Please try again.',
      })
    })

    it('should return 500 when update fails', async () => {
      // Mock guest authentication
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      const mockExistingArticle = {
        _id: 'article-123',
        content: 'Original content',
        uid: null as string | null,
      }

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValue(
        mockExistingArticle as unknown as ReturnType<
          typeof ArticleModel.findById
        >
      )
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(null)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          _id: 'article-123',
          editPrompt: 'Make it better',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'update_failed',
        message: 'Failed to update article.',
      })
    })

    it('should return 500 for database errors', async () => {
      // Mock guest authentication
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      mockRateLimiter.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockRejectedValue(new Error('Database error'))

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          _id: 'article-123',
          editPrompt: 'Make it better',
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

  describe('Rate Limiting per Article', () => {
    it('should track rate limits per article for same IP', async () => {
      // Mock guest authentication for both requests
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      const mockExistingArticle1 = {
        _id: 'article-123',
        content: 'Original content 1',
        uid: null as string | null,
      }

      const mockExistingArticle2 = {
        _id: 'article-456',
        content: 'Original content 2',
        uid: null as string | null,
      }

      const mockEditedArticle1 = {
        _id: 'article-123',
        content: 'Edited content 1',
      }

      const mockEditedArticle2 = {
        _id: 'article-456',
        content: 'Edited content 2',
      }

      // First article should be allowed
      mockRateLimiter.checkLimit.mockResolvedValueOnce({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValueOnce(
        mockExistingArticle1 as unknown as ReturnType<
          typeof ArticleModel.findById
        >
      )
      mockArticleModel.findByIdAndUpdate.mockResolvedValueOnce(
        mockEditedArticle1 as unknown as ReturnType<
          typeof ArticleModel.findByIdAndUpdate
        >
      )

      const { req: req1, res: res1 } = createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          _id: 'article-123',
          editPrompt: 'Make it better',
        },
      })

      await handler(req1, res1)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req1,
        'edit',
        'article-123',
        undefined,
        undefined
      )
      expect(res1._getStatusCode()).toBe(200)

      // Second article should also be allowed (different article)
      mockRateLimiter.checkLimit.mockResolvedValueOnce({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 86400000,
      })

      mockArticleModel.findById.mockResolvedValueOnce(
        mockExistingArticle2 as unknown as ReturnType<
          typeof ArticleModel.findById
        >
      )
      mockArticleModel.findByIdAndUpdate.mockResolvedValueOnce(
        mockEditedArticle2 as unknown as ReturnType<
          typeof ArticleModel.findByIdAndUpdate
        >
      )

      const { req: req2, res: res2 } = createMocks<
        NextApiRequest,
        NextApiResponse
      >({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        body: {
          _id: 'article-456',
          editPrompt: 'Make it better',
        },
      })

      await handler(req2, res2)

      expect(mockRateLimiter.checkLimit).toHaveBeenCalledWith(
        req2,
        'edit',
        'article-456',
        undefined,
        undefined
      )
      expect(res2._getStatusCode()).toBe(200)
    })
  })
})
