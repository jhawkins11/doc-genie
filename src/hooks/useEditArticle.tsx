import { useErrorContext } from '@/lib/contexts/ErrorContext'
import Article from '@/types/Article'
import axios from 'axios'
import mongoose from 'mongoose'
import { useState, useEffect } from 'react'
import { auth } from '@/lib/initializeFirebaseApp'
import { useAuthState } from 'react-firebase-hooks/auth'

export const useEditArticle = ({
  _id,
  editPrompt,
  enabled = true,
  onSuccess,
  onRateLimit,
  model = 'openai/gpt-3.5-turbo',
}: {
  _id?: mongoose.Types.ObjectId
  editPrompt?: string
  enabled: boolean
  onSuccess?: (article: Article) => void
  onRateLimit?: (isGuest: boolean, message: string) => void
  model?: string
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const { error, setError } = useErrorContext()
  const [user] = useAuthState(auth)
  useEffect(() => {
    const generateArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const requestBody: Record<string, string> = {
          editPrompt,
          timezone,
        }

        if (_id) {
          requestBody._id = _id.toString()
        }

        if (model) {
          requestBody.model = model
        }

        // Get Firebase ID token for authenticated requests
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (user) {
          try {
            const idToken = await user.getIdToken()
            headers.Authorization = `Bearer ${idToken}`
          } catch (error) {
            console.warn('Failed to get Firebase ID token:', error)
            // Continue without token - will be treated as guest request
          }
        }

        const res = await axios.post('/api/articles/edit', requestBody, {
          headers,
        })
        const data = res.data
        if (data.error) {
          throw new Error(data.error)
        }
        if (onSuccess) {
          onSuccess(data as Article)
        }
        setLoading(false)
        setSuccess(true)
      } catch (err: unknown) {
        setLoading(false)

        // Check if this is a rate limit error
        const error = err as {
          response?: {
            status: number
            data: { error: string; message: string }
          }
        }
        if (
          error.response?.status === 429 &&
          error.response?.data?.error === 'rate_limit_exceeded'
        ) {
          const message = error.response.data.message || 'Rate limit exceeded'
          const isGuest = !user

          if (onRateLimit) {
            onRateLimit(isGuest, message)
            return // Don't set the error in the error context for rate limits
          }
        }

        // For all other errors, use the existing error handling
        setError(err as Error)
      }
    }

    if (editPrompt && _id && enabled) {
      generateArticle()
    }
  }, [editPrompt, _id, enabled, model, user, onSuccess, onRateLimit, setError])
  return { loading, success }
}
