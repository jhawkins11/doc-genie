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
}: {
  topic: string | null
  subtopic?: string | null
  parentid?: mongoose.Types.ObjectId
  enabled: boolean
  onSuccess?: (article: Article) => void
}) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const generateArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.post('/api/articles/generate', {
          topic,
          subtopic,
          parentid,
        })
        const data = res.data
        if (data.error) {
          throw new Error(data.error)
        }
        setArticle(data as Article)
        if (onSuccess) {
          onSuccess(data as Article)
        }
      } catch (err) {
        setError((err as any).message)
      } finally {
        setLoading(false)
        setSuccess(true)
      }
    }

    if (topic && enabled) {
      generateArticle()
    }
  }, [topic, subtopic, parentid, enabled])
  return { article, loading, error, success }
}
