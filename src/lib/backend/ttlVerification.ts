import mongoose from 'mongoose'
import { ArticleModel } from '@/models/ArticleModel'

interface TTLVerificationResult {
  success: boolean
  message: string
  details?: {
    guestArticleCreated?: boolean
    authenticatedArticleCreated?: boolean
    indexExists?: boolean
    indexConfiguration?: unknown
  }
}

/**
 * Creates test articles to verify TTL behavior
 * @param testDurationMinutes Optional duration to set createdAt in the past for testing
 * @returns Promise<TTLVerificationResult> Result of the verification test
 */
export async function createTTLTestArticles(
  testDurationMinutes: number = 0
): Promise<TTLVerificationResult> {
  try {
    const testTimestamp =
      testDurationMinutes > 0
        ? new Date(Date.now() - testDurationMinutes * 60 * 1000)
        : new Date()

    // Create a guest article for TTL testing
    const guestArticle = new ArticleModel({
      title: 'TTL Test Guest Article',
      content:
        'This is a test guest article that should be automatically deleted by TTL',
      slug: `ttl-test-guest-${Date.now()}`,
      isGuest: true,
      createdAt: testTimestamp,
      updatedAt: testTimestamp,
    })

    // Create an authenticated user article (should not be affected by TTL)
    const authenticatedArticle = new ArticleModel({
      title: 'TTL Test Authenticated Article',
      content:
        'This is a test authenticated article that should NOT be deleted by TTL',
      slug: `ttl-test-auth-${Date.now()}`,
      uid: 'test-user-uid',
      isGuest: false,
      createdAt: testTimestamp,
      updatedAt: testTimestamp,
    })

    await guestArticle.save()
    await authenticatedArticle.save()

    return {
      success: true,
      message: 'TTL test articles created successfully',
      details: {
        guestArticleCreated: true,
        authenticatedArticleCreated: true,
      },
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Failed to create TTL test articles:', errorMessage)

    return {
      success: false,
      message: `Failed to create test articles: ${errorMessage}`,
    }
  }
}

/**
 * Verifies TTL index configuration and behavior
 * @returns Promise<TTLVerificationResult> Result of the TTL verification
 */
export async function verifyTTLConfiguration(): Promise<TTLVerificationResult> {
  try {
    const collection = mongoose.connection.db?.collection('articles')

    if (!collection) {
      throw new Error(
        'Articles collection not found - database connection may not be established'
      )
    }

    // Get all indexes on the collection
    const indexes = await collection.indexes()

    // Find the TTL index
    const ttlIndex = indexes.find(
      (index) =>
        index.key?.createdAt === 1 &&
        index.expireAfterSeconds === 172800 &&
        index.partialFilterExpression?.isGuest === true
    )

    if (!ttlIndex) {
      return {
        success: false,
        message: 'TTL index not found on articles collection',
        details: {
          indexExists: false,
        },
      }
    }

    // Verify TTL index configuration
    const expectedConfig = {
      expireAfterSeconds: 172800, // 48 hours
      partialFilterExpression: { isGuest: true },
    }

    const configMatches =
      ttlIndex.expireAfterSeconds === expectedConfig.expireAfterSeconds &&
      JSON.stringify(ttlIndex.partialFilterExpression) ===
        JSON.stringify(expectedConfig.partialFilterExpression)

    if (!configMatches) {
      return {
        success: false,
        message: 'TTL index configuration does not match expected values',
        details: {
          indexExists: true,
          indexConfiguration: ttlIndex,
        },
      }
    }

    return {
      success: true,
      message: 'TTL index configuration verified successfully',
      details: {
        indexExists: true,
        indexConfiguration: ttlIndex,
      },
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Failed to verify TTL configuration:', errorMessage)

    return {
      success: false,
      message: `Failed to verify TTL configuration: ${errorMessage}`,
    }
  }
}

/**
 * Counts guest and authenticated articles for monitoring TTL behavior
 * @returns Promise<{guestCount: number, authenticatedCount: number}> Article counts
 */
export async function getArticleCounts(): Promise<{
  guestCount: number
  authenticatedCount: number
}> {
  try {
    const guestCount = await ArticleModel.countDocuments({ isGuest: true })
    const authenticatedCount = await ArticleModel.countDocuments({
      isGuest: false,
    })

    return { guestCount, authenticatedCount }
  } catch (error) {
    console.error('Failed to get article counts:', error)
    return { guestCount: 0, authenticatedCount: 0 }
  }
}

/**
 * Monitors TTL deletions by checking article counts over time
 * @param intervalMinutes How often to check counts (default: 5 minutes)
 * @param durationMinutes How long to monitor (default: 30 minutes)
 * @returns Promise<void>
 */
export async function monitorTTLDeletions(
  intervalMinutes: number = 5,
  durationMinutes: number = 30
): Promise<void> {
  const startTime = Date.now()
  const endTime = startTime + durationMinutes * 60 * 1000
  const interval = intervalMinutes * 60 * 1000

  console.log(`Starting TTL monitoring for ${durationMinutes} minutes...`)

  const initialCounts = await getArticleCounts()
  console.log(
    `Initial counts - Guest: ${initialCounts.guestCount}, Authenticated: ${initialCounts.authenticatedCount}`
  )

  const monitorInterval = setInterval(async () => {
    try {
      const currentCounts = await getArticleCounts()
      const timestamp = new Date().toISOString()

      console.log(
        `[${timestamp}] Article counts - Guest: ${currentCounts.guestCount}, Authenticated: ${currentCounts.authenticatedCount}`
      )

      if (currentCounts.guestCount < initialCounts.guestCount) {
        console.log(
          `TTL deletion detected: ${
            initialCounts.guestCount - currentCounts.guestCount
          } guest articles deleted`
        )
      }

      if (Date.now() >= endTime) {
        clearInterval(monitorInterval)
        console.log('TTL monitoring completed')
      }
    } catch (error) {
      console.error('Error during TTL monitoring:', error)
    }
  }, interval)
}

/**
 * Comprehensive TTL functionality test
 * @returns Promise<TTLVerificationResult> Complete test results
 */
export async function runCompleteTTLTest(): Promise<TTLVerificationResult> {
  try {
    console.log('Starting comprehensive TTL test...')

    // Step 1: Verify TTL index configuration
    const configResult = await verifyTTLConfiguration()
    if (!configResult.success) {
      return configResult
    }
    console.log('✓ TTL index configuration verified')

    // Step 2: Get initial article counts
    const initialCounts = await getArticleCounts()
    console.log(
      `✓ Initial article counts - Guest: ${initialCounts.guestCount}, Authenticated: ${initialCounts.authenticatedCount}`
    )

    // Step 3: Create test articles
    const testResult = await createTTLTestArticles()
    if (!testResult.success) {
      return testResult
    }
    console.log('✓ Test articles created')

    // Step 4: Verify articles were created
    const afterCreationCounts = await getArticleCounts()
    const expectedGuestCount = initialCounts.guestCount + 1
    const expectedAuthCount = initialCounts.authenticatedCount + 1

    if (
      afterCreationCounts.guestCount !== expectedGuestCount ||
      afterCreationCounts.authenticatedCount !== expectedAuthCount
    ) {
      return {
        success: false,
        message: 'Test articles were not created as expected',
      }
    }
    console.log('✓ Test articles verified in database')

    return {
      success: true,
      message: 'Complete TTL test passed successfully',
      details: {
        indexExists: true,
        guestArticleCreated: true,
        authenticatedArticleCreated: true,
        indexConfiguration: configResult.details?.indexConfiguration,
      },
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Complete TTL test failed:', errorMessage)

    return {
      success: false,
      message: `Complete TTL test failed: ${errorMessage}`,
    }
  }
}
