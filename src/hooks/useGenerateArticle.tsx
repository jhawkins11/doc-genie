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
  userId = null,
  model = 'gpt-3.5-turbo',
}: {
  topic: string | null
  model?: string
  subtopic?: string | null
  parentid?: mongoose.Types.ObjectId
  enabled: boolean
  onSuccess?: (article: Article) => void
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
        const res = await axios.post('/api/articles/generate', {
          topic,
          model,
          subtopic,
          parentid,
          uid: userId,
        })
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
      } catch (err) {
        setError(err as any)
        setLoading(false)
      }
    }

    if (topic && enabled) {
      generateArticle()
    }
  }, [topic, subtopic, parentid, enabled])
  return { article, loading, success }
}
