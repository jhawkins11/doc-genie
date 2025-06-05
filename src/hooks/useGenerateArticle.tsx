import { useErrorContext } from '@/lib/contexts/ErrorContext'
import Article from '@/types/Article'
import axios from 'axios'
import mongoose from 'mongoose'
import { useState, useEffect } from 'react'

export const useGenerateArticle = ({
  topic,
  subtopic,
  parentid,
  enabled = true,
  onSuccess,
  onRateLimit,
  userId = null,
  model = 'openai/gpt-3.5-turbo',
}: {
  topic: string | null
  model?: string
  subtopic?: string | null
  parentid?: mongoose.Types.ObjectId
  enabled: boolean
  onSuccess?: (article: Article) => void
  onRateLimit?: (isGuest: boolean, message: string) => void
  userId?: string
}) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const { error, setError } = useErrorContext()

  useEffect(() => {
    const generateArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const requestBody: Record<string, string> = {
          topic,
          model,
        }

        if (subtopic) {
          requestBody.subtopic = subtopic
        }

        if (parentid) {
          requestBody.parentid = parentid.toString()
        }

        if (userId) {
          requestBody.uid = userId
        }

        const res = await axios.post('/api/articles/generate', requestBody)
        const data = res.data
        if (data.error) {
          throw new Error(data.error)
        }
        setArticle(data as Article)
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
          // Determine if user is guest based on userId parameter
          const isGuest = !userId

          if (onRateLimit) {
            onRateLimit(isGuest, message)
            return // Don't set the error in the error context for rate limits
          }
        }

        // For all other errors, use the existing error handling
        setError(err as Error)
      }
    }

    if (topic && enabled) {
      generateArticle()
    }
  }, [
    topic,
    subtopic,
    parentid,
    enabled,
    model,
    userId,
    onSuccess,
    onRateLimit,
    setError,
  ])

  return { article, loading, success }
}
