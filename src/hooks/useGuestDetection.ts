import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import type Article from '@/types/Article'

interface GuestDetectionResult {
  isGuest: boolean
  isAuthenticated: boolean
  isLoading: boolean
  isGuestArticle: (article: Article | null | undefined) => boolean
}

/**
 * Custom hook for detecting guest status and guest articles
 * Provides consistent guest detection logic across components
 */
export const useGuestDetection = (): GuestDetectionResult => {
  const [user, loading] = useAuthState(auth)

  const isGuest = !user
  const isAuthenticated = !!user

  const isGuestArticle = (article: Article | null | undefined): boolean => {
    return article?.isGuest === true
  }

  return {
    isGuest,
    isAuthenticated,
    isLoading: loading,
    isGuestArticle,
  }
}
