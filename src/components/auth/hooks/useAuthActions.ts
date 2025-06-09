import { useCallback, useState } from 'react'
import {
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
  resetPassword,
  logout,
} from '@/utils/firebaseUtils'
import tryCatch from '@/utils/tryCatch'

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleAuthAction = useCallback(
    async <T>(action: () => Promise<T>, onSuccess?: () => void) => {
      setIsLoading(true)
      await tryCatch(async () => {
        await action()
        onSuccess?.()
      }, setError)
      setIsLoading(false)
    },
    []
  )

  const handleLoginWithEmail = useCallback(
    async (email: string, password: string, onSuccess?: () => void) => {
      await handleAuthAction(() => loginWithEmail(email, password), onSuccess)
    },
    [handleAuthAction]
  )

  const handleSignupWithEmail = useCallback(
    async (email: string, password: string, onSuccess?: () => void) => {
      await handleAuthAction(() => signupWithEmail(email, password), onSuccess)
    },
    [handleAuthAction]
  )

  const handleResetPassword = useCallback(
    async (email: string, onSuccess?: () => void) => {
      await handleAuthAction(() => resetPassword(email), onSuccess)
    },
    [handleAuthAction]
  )

  const handleLoginWithGoogle = useCallback(
    async (onSuccess?: () => void) => {
      await handleAuthAction(loginWithGoogle, onSuccess)
    },
    [handleAuthAction]
  )

  const handleLogout = useCallback(
    async (onSuccess?: () => void) => {
      await handleAuthAction(logout, onSuccess)
    },
    [handleAuthAction]
  )

  return {
    isLoading,
    error,
    clearError,
    handleLoginWithEmail,
    handleSignupWithEmail,
    handleResetPassword,
    handleLoginWithGoogle,
    handleLogout,
  }
}
