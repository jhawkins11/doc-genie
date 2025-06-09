import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '../[uid]'
import { ArticleModel } from '@/models/ArticleModel'
import connectToDb from '@/utils/connectToDb'
import {
  requireAuthentication,
  AuthenticationError,
} from '@/lib/backend/authService'
import buildArticleTree from '@/utils/buildArticleTree'
import type Article from '@/types/Article'

jest.mock('@/models/ArticleModel')
jest.mock('@/utils/connectToDb')
jest.mock('@/lib/backend/authService', () => ({
  ...jest.requireActual('@/lib/backend/authService'),
  requireAuthentication: jest.fn(),
}))
jest.mock('@/utils/buildArticleTree')

const mockArticleModel = ArticleModel as jest.Mocked<typeof ArticleModel>
const mockConnectToDb = connectToDb as jest.MockedFunction<typeof connectToDb>
const mockRequireAuthentication = requireAuthentication as jest.MockedFunction<
  typeof requireAuthentication
>
const mockBuildArticleTree = buildArticleTree as jest.MockedFunction<
  typeof buildArticleTree
>

describe('/api/articles/user/[uid] - Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConnectToDb.mockResolvedValue(undefined)
  })

  describe('Authentication Requirements', () => {
    it('should require authentication for user-specific endpoint', async () => {
      // Mock authentication service to throw missing token error
      mockRequireAuthentication.mockRejectedValue(
        new AuthenticationError(
          'Authentication token is required',
          'missing_token',
          401
        )
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'missing_token',
        message: 'Authentication token is required',
      })

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })

    it('should reject invalid authentication tokens', async () => {
      // Mock authentication service to throw invalid token error
      mockRequireAuthentication.mockRejectedValue(
        new AuthenticationError(
          'Invalid authentication token',
          'invalid_token',
          401
        )
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'invalid_token',
        message: 'Invalid authentication token',
      })

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })

    it('should reject expired authentication tokens', async () => {
      // Mock authentication service to throw expired token error
      mockRequireAuthentication.mockRejectedValue(
        new AuthenticationError(
          'Authentication token has expired',
          'token_expired',
          401
        )
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer expired-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'token_expired',
        message: 'Authentication token has expired',
      })

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })
  })

  describe('Authorization Checks', () => {
    it('should allow authenticated user to access their own articles', async () => {
      // Mock authentication service to return valid user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      })

      const mockTopLevelArticles = [
        {
          _id: 'article-1',
          title: 'User Article 1',
          uid: 'user-123',
          parentid: '',
          toObject: () => ({
            _id: 'article-1',
            title: 'User Article 1',
            uid: 'user-123',
            parentid: '',
          }),
        },
        {
          _id: 'article-2',
          title: 'User Article 2',
          uid: 'user-123',
          parentid: '',
          toObject: () => ({
            _id: 'article-2',
            title: 'User Article 2',
            uid: 'user-123',
            parentid: '',
          }),
        },
      ]

      const mockArticlesWithChildren = [
        {
          _id: 'article-1',
          title: 'User Article 1',
          uid: 'user-123',
          parentid: '',
          childArticles: [] as Article[],
        },
        {
          _id: 'article-2',
          title: 'User Article 2',
          uid: 'user-123',
          parentid: '',
          childArticles: [] as Article[],
        },
      ]

      mockArticleModel.find.mockResolvedValue(
        mockTopLevelArticles as unknown as ReturnType<typeof ArticleModel.find>
      )

      mockBuildArticleTree.mockImplementation(async (article) => {
        const articleObj = article.toObject()
        return { ...articleObj, childArticles: [] }
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual(mockArticlesWithChildren)

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).toHaveBeenCalledWith({
        uid: 'user-123',
        parentid: '',
      })
      expect(mockBuildArticleTree).toHaveBeenCalledTimes(2)
    })

    it('should prevent authenticated user from accessing other users articles', async () => {
      // Mock authentication service to return different user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-456',
        email: 'other@example.com',
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(403)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'forbidden',
        message: 'You can only access your own articles',
      })

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })

    it('should handle string uid parameter correctly', async () => {
      // Mock authentication service to return valid user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-with-special-chars',
        email: 'test@example.com',
      })

      const mockTopLevelArticles = [
        {
          _id: 'article-1',
          title: 'User Article 1',
          uid: 'user-with-special-chars',
          parentid: '',
          toObject: () => ({
            _id: 'article-1',
            title: 'User Article 1',
            uid: 'user-with-special-chars',
            parentid: '',
          }),
        },
      ]

      const mockArticlesWithChildren = [
        {
          _id: 'article-1',
          title: 'User Article 1',
          uid: 'user-with-special-chars',
          parentid: '',
          childArticles: [] as Article[],
        },
      ]

      mockArticleModel.find.mockResolvedValue(
        mockTopLevelArticles as unknown as ReturnType<typeof ArticleModel.find>
      )

      mockBuildArticleTree.mockImplementation(async (article) => {
        const articleObj = article.toObject()
        return { ...articleObj, childArticles: [] }
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-with-special-chars' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual(mockArticlesWithChildren)

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).toHaveBeenCalledWith({
        uid: 'user-with-special-chars',
        parentid: '',
      })
      expect(mockBuildArticleTree).toHaveBeenCalledTimes(1)
    })
  })

  describe('HTTP Method Validation', () => {
    it('should only allow GET method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'method_not_allowed',
        message: 'Only GET method is allowed',
      })

      expect(mockRequireAuthentication).not.toHaveBeenCalled()
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })

    it('should reject PUT method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'method_not_allowed',
        message: 'Only GET method is allowed',
      })

      expect(mockRequireAuthentication).not.toHaveBeenCalled()
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })

    it('should reject DELETE method', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(405)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'method_not_allowed',
        message: 'Only GET method is allowed',
      })

      expect(mockRequireAuthentication).not.toHaveBeenCalled()
      expect(mockArticleModel.find).not.toHaveBeenCalled()
    })
  })

  describe('Database Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock authentication service to return valid user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      })

      mockConnectToDb.mockRejectedValue(new Error('Database connection failed'))

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'internal_server_error',
        message: 'An unexpected error occurred while fetching articles',
      })

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockConnectToDb).toHaveBeenCalled()
    })

    it('should handle article query errors', async () => {
      // Mock authentication service to return valid user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      })

      mockArticleModel.find.mockRejectedValue(new Error('Query failed'))

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual({
        error: 'internal_server_error',
        message: 'An unexpected error occurred while fetching articles',
      })

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).toHaveBeenCalledWith({
        uid: 'user-123',
        parentid: '',
      })
    })
  })

  describe('Successful Operations', () => {
    it('should return empty array when user has no articles', async () => {
      // Mock authentication service to return valid user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      })

      mockArticleModel.find.mockResolvedValue(
        [] as unknown as ReturnType<typeof ArticleModel.find>
      )

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual([])

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).toHaveBeenCalledWith({
        uid: 'user-123',
        parentid: '',
      })
    })

    it('should return only top-level articles (parentid empty)', async () => {
      // Mock authentication service to return valid user
      mockRequireAuthentication.mockResolvedValue({
        uid: 'user-123',
        email: 'test@example.com',
      })

      const mockTopLevelArticles = [
        {
          _id: 'article-1',
          title: 'Top Level Article 1',
          uid: 'user-123',
          parentid: '',
          toObject: () => ({
            _id: 'article-1',
            title: 'Top Level Article 1',
            uid: 'user-123',
            parentid: '',
          }),
        },
        {
          _id: 'article-2',
          title: 'Top Level Article 2',
          uid: 'user-123',
          parentid: '',
          toObject: () => ({
            _id: 'article-2',
            title: 'Top Level Article 2',
            uid: 'user-123',
            parentid: '',
          }),
        },
      ]

      const mockArticlesWithChildren = [
        {
          _id: 'article-1',
          title: 'Top Level Article 1',
          uid: 'user-123',
          parentid: '',
          childArticles: [] as Article[],
        },
        {
          _id: 'article-2',
          title: 'Top Level Article 2',
          uid: 'user-123',
          parentid: '',
          childArticles: [] as Article[],
        },
      ]

      mockArticleModel.find.mockResolvedValue(
        mockTopLevelArticles as unknown as ReturnType<typeof ArticleModel.find>
      )

      mockBuildArticleTree.mockImplementation(async (article) => {
        const articleObj = article.toObject()
        return { ...articleObj, childArticles: [] }
      })

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
        query: { uid: 'user-123' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const responseData = JSON.parse(res._getData())
      expect(responseData).toEqual(mockArticlesWithChildren)

      expect(mockRequireAuthentication).toHaveBeenCalledWith(req)
      expect(mockArticleModel.find).toHaveBeenCalledWith({
        uid: 'user-123',
        parentid: '',
      })

      // Verify that the query specifically looks for top-level articles
      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          parentid: '',
        })
      )
      expect(mockBuildArticleTree).toHaveBeenCalledTimes(2)
    })
  })
})
