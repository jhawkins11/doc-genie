import mongoose from 'mongoose'
import { ArticleModel } from '@/models/ArticleModel'
import {
  createTTLTestArticles,
  verifyTTLConfiguration,
  getArticleCounts,
  runCompleteTTLTest,
} from '../ttlVerification'

// Mock dependencies
jest.mock('mongoose')
jest.mock('@/models/ArticleModel', () => {
  return {
    ArticleModel: jest.fn().mockImplementation(() => ({
      save: jest.fn(),
    })),
  }
})

const mockMongoose = mongoose as jest.Mocked<typeof mongoose>
const MockedArticleModel = ArticleModel as jest.MockedClass<typeof ArticleModel>

// Add static methods to the mocked constructor
Object.assign(MockedArticleModel, {
  countDocuments: jest.fn(),
})

describe('TTL Verification', () => {
  let mockCollection: {
    indexes: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockCollection = {
      indexes: jest.fn(),
    }

    Object.defineProperty(mockMongoose, 'connection', {
      value: {
        db: {
          collection: jest.fn().mockReturnValue(mockCollection),
        },
      },
      writable: true,
      configurable: true,
    })
  })

  describe('createTTLTestArticles', () => {
    it('should create guest and authenticated test articles', async () => {
      const mockGuestArticle = {
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockAuthArticle = {
        save: jest.fn().mockResolvedValue(undefined),
      }

      MockedArticleModel.mockReturnValueOnce(
        mockGuestArticle as never
      ).mockReturnValueOnce(mockAuthArticle as never)

      const result = await createTTLTestArticles()

      expect(result.success).toBe(true)
      expect(result.message).toBe('TTL test articles created successfully')
      expect(result.details?.guestArticleCreated).toBe(true)
      expect(result.details?.authenticatedArticleCreated).toBe(true)
      expect(mockGuestArticle.save).toHaveBeenCalled()
      expect(mockAuthArticle.save).toHaveBeenCalled()
    })

    it('should create articles with past timestamp when testDurationMinutes is provided', async () => {
      const mockGuestArticle = {
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockAuthArticle = {
        save: jest.fn().mockResolvedValue(undefined),
      }

      MockedArticleModel.mockReturnValueOnce(
        mockGuestArticle as never
      ).mockReturnValueOnce(mockAuthArticle as never)

      const testDurationMinutes = 60 // 1 hour ago
      await createTTLTestArticles(testDurationMinutes)

      // Verify ArticleModel was called with past timestamp
      const guestArticleCall = MockedArticleModel.mock.calls[0][0] as {
        createdAt: Date
        isGuest: boolean
      }
      const authArticleCall = MockedArticleModel.mock.calls[1][0] as {
        createdAt: Date
        isGuest: boolean
      }

      expect(guestArticleCall.createdAt).toBeInstanceOf(Date)
      expect(authArticleCall.createdAt).toBeInstanceOf(Date)
      expect(guestArticleCall.isGuest).toBe(true)
      expect(authArticleCall.isGuest).toBe(false)
    })

    it('should handle article creation error', async () => {
      const mockGuestArticle = {
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
      }

      MockedArticleModel.mockReturnValueOnce(mockGuestArticle as never)

      const result = await createTTLTestArticles()

      expect(result.success).toBe(false)
      expect(result.message).toContain(
        'Failed to create test articles: Save failed'
      )
    })
  })

  describe('verifyTTLConfiguration', () => {
    it('should verify TTL index configuration successfully', async () => {
      const expectedIndex = {
        key: { createdAt: 1 },
        expireAfterSeconds: 172800,
        partialFilterExpression: { isGuest: true },
        name: 'guest_articles_ttl',
      }

      mockCollection.indexes.mockResolvedValue([expectedIndex])

      const result = await verifyTTLConfiguration()

      expect(result.success).toBe(true)
      expect(result.message).toBe(
        'TTL index configuration verified successfully'
      )
      expect(result.details?.indexExists).toBe(true)
      expect(result.details?.indexConfiguration).toEqual(expectedIndex)
    })

    it('should fail when TTL index does not exist', async () => {
      mockCollection.indexes.mockResolvedValue([
        { key: { _id: 1 }, name: '_id_' },
      ])

      const result = await verifyTTLConfiguration()

      expect(result.success).toBe(false)
      expect(result.message).toBe('TTL index not found on articles collection')
      expect(result.details?.indexExists).toBe(false)
    })

    it('should fail when TTL index configuration is incorrect', async () => {
      // Provide an index with wrong expiration time - this won't be found by the initial search
      const incorrectIndex = {
        key: { createdAt: 1 },
        expireAfterSeconds: 86400, // Wrong expiration time (24 hours instead of 48)
        partialFilterExpression: { isGuest: true },
        name: 'guest_articles_ttl',
      }

      mockCollection.indexes.mockResolvedValue([incorrectIndex])

      const result = await verifyTTLConfiguration()

      expect(result.success).toBe(false)
      expect(result.message).toBe('TTL index not found on articles collection')
      expect(result.details?.indexExists).toBe(false)
    })

    it('should handle database connection error', async () => {
      Object.defineProperty(mockMongoose, 'connection', {
        value: {
          db: null,
        },
        writable: true,
        configurable: true,
      })

      const result = await verifyTTLConfiguration()

      expect(result.success).toBe(false)
      expect(result.message).toContain('Articles collection not found')
    })
  })

  describe('getArticleCounts', () => {
    it('should return correct article counts', async () => {
      const mockCountDocuments = MockedArticleModel.countDocuments as jest.Mock
      mockCountDocuments
        .mockResolvedValueOnce(5) // guest count
        .mockResolvedValueOnce(10) // authenticated count

      const result = await getArticleCounts()

      expect(result.guestCount).toBe(5)
      expect(result.authenticatedCount).toBe(10)
      expect(mockCountDocuments).toHaveBeenCalledWith({
        isGuest: true,
      })
      expect(mockCountDocuments).toHaveBeenCalledWith({
        isGuest: false,
      })
    })

    it('should return zero counts on error', async () => {
      const mockCountDocuments = MockedArticleModel.countDocuments as jest.Mock
      mockCountDocuments.mockRejectedValue(new Error('Database error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await getArticleCounts()

      expect(result.guestCount).toBe(0)
      expect(result.authenticatedCount).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get article counts:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('runCompleteTTLTest', () => {
    it('should run complete TTL test successfully', async () => {
      // Mock TTL configuration verification
      const expectedIndex = {
        key: { createdAt: 1 },
        expireAfterSeconds: 172800,
        partialFilterExpression: { isGuest: true },
        name: 'guest_articles_ttl',
      }
      mockCollection.indexes.mockResolvedValue([expectedIndex])

      // Mock article counts
      const mockCountDocuments = MockedArticleModel.countDocuments as jest.Mock
      mockCountDocuments
        .mockResolvedValueOnce(2) // initial guest count
        .mockResolvedValueOnce(5) // initial auth count
        .mockResolvedValueOnce(3) // after creation guest count
        .mockResolvedValueOnce(6) // after creation auth count

      // Mock article creation
      const mockGuestArticle = { save: jest.fn().mockResolvedValue(undefined) }
      const mockAuthArticle = { save: jest.fn().mockResolvedValue(undefined) }
      MockedArticleModel.mockReturnValueOnce(
        mockGuestArticle as never
      ).mockReturnValueOnce(mockAuthArticle as never)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const result = await runCompleteTTLTest()

      expect(result.success).toBe(true)
      expect(result.message).toBe('Complete TTL test passed successfully')
      expect(result.details?.indexExists).toBe(true)
      expect(result.details?.guestArticleCreated).toBe(true)
      expect(result.details?.authenticatedArticleCreated).toBe(true)

      consoleSpy.mockRestore()
    })

    it('should fail when TTL configuration verification fails', async () => {
      mockCollection.indexes.mockResolvedValue([])

      const result = await runCompleteTTLTest()

      expect(result.success).toBe(false)
      expect(result.message).toBe('TTL index not found on articles collection')
    })

    it('should fail when test articles are not created as expected', async () => {
      // Mock TTL configuration verification
      const expectedIndex = {
        key: { createdAt: 1 },
        expireAfterSeconds: 172800,
        partialFilterExpression: { isGuest: true },
        name: 'guest_articles_ttl',
      }
      mockCollection.indexes.mockResolvedValue([expectedIndex])

      // Mock article counts - simulate articles not being created
      const mockCountDocuments = MockedArticleModel.countDocuments as jest.Mock
      mockCountDocuments
        .mockResolvedValueOnce(2) // initial guest count
        .mockResolvedValueOnce(5) // initial auth count
        .mockResolvedValueOnce(2) // after creation guest count (no change)
        .mockResolvedValueOnce(5) // after creation auth count (no change)

      // Mock article creation
      const mockGuestArticle = { save: jest.fn().mockResolvedValue(undefined) }
      const mockAuthArticle = { save: jest.fn().mockResolvedValue(undefined) }
      MockedArticleModel.mockReturnValueOnce(
        mockGuestArticle as never
      ).mockReturnValueOnce(mockAuthArticle as never)

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const result = await runCompleteTTLTest()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Test articles were not created as expected')

      consoleSpy.mockRestore()
    })
  })
})
