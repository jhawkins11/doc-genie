import { useGuestDetection } from '../useGuestDetection'
import type Article from '@/types/Article'
import mongoose from 'mongoose'

// Mock react-firebase-hooks/auth
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(),
}))

// Mock Firebase auth
jest.mock('@/lib/initializeFirebaseApp', () => ({
  auth: {},
}))

const mockUseAuthState = require('react-firebase-hooks/auth').useAuthState

describe('useGuestDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns guest status when user is not authenticated', () => {
    mockUseAuthState.mockReturnValue([null, false])

    const result = useGuestDetection()

    expect(result.isGuest).toBe(true)
    expect(result.isAuthenticated).toBe(false)
    expect(result.isLoading).toBe(false)
  })

  it('returns authenticated status when user is authenticated', () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' }
    mockUseAuthState.mockReturnValue([mockUser, false])

    const result = useGuestDetection()

    expect(result.isGuest).toBe(false)
    expect(result.isAuthenticated).toBe(true)
    expect(result.isLoading).toBe(false)
  })

  it('returns loading status when auth is loading', () => {
    mockUseAuthState.mockReturnValue([null, true])

    const result = useGuestDetection()

    expect(result.isLoading).toBe(true)
  })

  it('correctly identifies guest articles', () => {
    mockUseAuthState.mockReturnValue([null, false])

    const result = useGuestDetection()

    const guestArticle: Article = {
      _id: new mongoose.Types.ObjectId(),
      parentid: 'parent-id',
      title: 'Test Article',
      content: 'Test content',
      slug: 'test-article',
      isGuest: true,
    }

    expect(result.isGuestArticle(guestArticle)).toBe(true)
  })

  it('correctly identifies non-guest articles', () => {
    mockUseAuthState.mockReturnValue([null, false])

    const result = useGuestDetection()

    const userArticle: Article = {
      _id: new mongoose.Types.ObjectId(),
      parentid: 'parent-id',
      title: 'Test Article',
      content: 'Test content',
      slug: 'test-article',
      uid: 'user-id',
      isGuest: false,
    }

    expect(result.isGuestArticle(userArticle)).toBe(false)
  })

  it('handles null article input', () => {
    mockUseAuthState.mockReturnValue([null, false])

    const result = useGuestDetection()

    expect(result.isGuestArticle(null)).toBe(false)
    expect(result.isGuestArticle(undefined)).toBe(false)
  })

  it('returns consistent results across multiple calls', () => {
    mockUseAuthState.mockReturnValue([null, false])

    const result1 = useGuestDetection()
    const result2 = useGuestDetection()

    expect(result1.isGuest).toBe(result2.isGuest)
    expect(result1.isAuthenticated).toBe(result2.isAuthenticated)
    expect(result1.isLoading).toBe(result2.isLoading)
  })
})
