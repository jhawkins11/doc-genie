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

describe('/api/articles/edit - Authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectToDb.mockResolvedValue(undefined)
    mockGenerateAIArticle.mockResolvedValue(
      '# Edited Article\n\nEdited content here.'
    )
    mockRateLimiter.checkLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetTime: Date.now() + 86400000,
    })
  })

  describe('Guest Article Editing', () => {
    it('should allow guest users to edit guest articles', async () => {
      // Mock authentication for guest user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      // Mock finding a guest article (uid is null)
      const guestArticle = {
        _id: 'guest-article-id',
        title: 'Guest Article',
        content: '# Original Guest Article\n\nOriginal content.',
        uid: null as string | null,
        isGuest: true,
        parentid: '',
        slug: 'guest-article',
      }
      mockArticleModel.findById.mockResolvedValue(guestArticle)

      // Mock successful update
      const updatedArticle = {
        ...guestArticle,
        content: '# Edited Article\n\nEdited content here.',
      }
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(updatedArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'guest-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.content).toBe(
        '# Edited Article\n\nEdited content here.'
      )

      expect(mockArticleModel.findById).toHaveBeenCalledWith('guest-article-id')
      expect(mockArticleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'guest-article-id',
        { content: '# Edited Article\n\nEdited content here.' },
        { new: true }
      )
    })

    it('should allow authenticated users to edit guest articles', async () => {
      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      // Mock finding a guest article (uid is null)
      const guestArticle = {
        _id: 'guest-article-id',
        title: 'Guest Article',
        content: '# Original Guest Article\n\nOriginal content.',
        uid: null as string | null,
        isGuest: true,
        parentid: '',
        slug: 'guest-article',
      }
      mockArticleModel.findById.mockResolvedValue(guestArticle)

      // Mock successful update
      const updatedArticle = {
        ...guestArticle,
        content: '# Edited Article\n\nEdited content here.',
      }
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(updatedArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'guest-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.content).toBe(
        '# Edited Article\n\nEdited content here.'
      )
    })
  })

  describe('User Article Editing', () => {
    it('should allow users to edit their own articles', async () => {
      // Mock authentication for the article owner
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      // Mock finding a user article owned by user-123
      const userArticle = {
        _id: 'user-article-id',
        title: 'User Article',
        content: '# Original User Article\n\nOriginal content.',
        uid: 'user-123',
        isGuest: false,
        parentid: '',
        slug: 'user-article',
      }
      mockArticleModel.findById.mockResolvedValue(userArticle)

      // Mock successful update
      const updatedArticle = {
        ...userArticle,
        content: '# Edited Article\n\nEdited content here.',
      }
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(updatedArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'user-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.content).toBe(
        '# Edited Article\n\nEdited content here.'
      )
    })

    it('should prevent users from editing other users articles', async () => {
      // Mock authentication for a different user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-456', email: 'other@example.com' },
      })

      // Mock finding a user article owned by user-123
      const userArticle = {
        _id: 'user-article-id',
        title: 'User Article',
        content: '# Original User Article\n\nOriginal content.',
        uid: 'user-123',
        isGuest: false,
        parentid: '',
        slug: 'user-article',
      }
      mockArticleModel.findById.mockResolvedValue(userArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'user-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(403)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'forbidden',
        message: 'You can only edit your own articles.',
      })

      expect(mockArticleModel.findById).toHaveBeenCalledWith('user-article-id')
      expect(mockArticleModel.findByIdAndUpdate).not.toHaveBeenCalled()
      expect(mockGenerateAIArticle).not.toHaveBeenCalled()
    })

    it('should prevent guest users from editing user articles', async () => {
      // Mock authentication for guest user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })

      // Mock finding a user article
      const userArticle = {
        _id: 'user-article-id',
        title: 'User Article',
        content: '# Original User Article\n\nOriginal content.',
        uid: 'user-123',
        isGuest: false,
        parentid: '',
        slug: 'user-article',
      }
      mockArticleModel.findById.mockResolvedValue(userArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'user-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(403)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'forbidden',
        message: 'You can only edit your own articles.',
      })

      expect(mockArticleModel.findById).toHaveBeenCalledWith('user-article-id')
      expect(mockArticleModel.findByIdAndUpdate).not.toHaveBeenCalled()
      expect(mockGenerateAIArticle).not.toHaveBeenCalled()
    })
  })

  describe('Article Not Found', () => {
    it('should return 404 when article does not exist', async () => {
      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      // Mock article not found
      mockArticleModel.findById.mockResolvedValue(null)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'non-existent-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'article_not_found',
        message: 'Article not found.',
      })

      expect(mockArticleModel.findById).toHaveBeenCalledWith('non-existent-id')
      expect(mockArticleModel.findByIdAndUpdate).not.toHaveBeenCalled()
      expect(mockGenerateAIArticle).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle articles with undefined uid', async () => {
      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      // Mock finding a legacy guest article (uid is undefined)
      const legacyGuestArticle = {
        _id: 'legacy-guest-article-id',
        title: 'Legacy Guest Article',
        content: '# Original Legacy Article\n\nOriginal content.',
        uid: undefined as string | undefined,
        isGuest: true,
        parentid: '',
        slug: 'legacy-guest-article',
      }
      mockArticleModel.findById.mockResolvedValue(legacyGuestArticle)

      // Mock successful update
      const updatedArticle = {
        ...legacyGuestArticle,
        content: '# Edited Article\n\nEdited content here.',
      }
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(updatedArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'legacy-guest-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.content).toBe(
        '# Edited Article\n\nEdited content here.'
      )
    })

    it('should handle articles with empty string uid', async () => {
      // Mock authentication for authenticated user
      mockVerifyOptionalAuthentication.mockResolvedValue({
        isAuthenticated: true,
        isGuest: false,
        user: { uid: 'user-123', email: 'test@example.com' },
      })

      // Mock finding an article with empty string uid
      const emptyUidArticle = {
        _id: 'empty-uid-article-id',
        title: 'Empty UID Article',
        content: '# Original Article\n\nOriginal content.',
        uid: '',
        isGuest: true,
        parentid: '',
        slug: 'empty-uid-article',
      }
      mockArticleModel.findById.mockResolvedValue(emptyUidArticle)

      // Mock successful update
      const updatedArticle = {
        ...emptyUidArticle,
        content: '# Edited Article\n\nEdited content here.',
      }
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(updatedArticle)

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
        body: {
          editPrompt: 'Make this article more engaging',
          _id: 'empty-uid-article-id',
        },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData.content).toBe(
        '# Edited Article\n\nEdited content here.'
      )
    })
  })
})
