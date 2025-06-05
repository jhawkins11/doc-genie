import { useErrorContext } from '@/lib/contexts/ErrorContext'
import Article from '@/types/Article'
import axios from 'axios'
import mongoose from 'mongoose'
import { useState, useEffect } from 'react'

export const useEditArticle = ({
  _id,
  editPrompt,
  enabled = true,
  onSuccess,
  model = 'openai/gpt-3.5-turbo',
}: {
  _id?: mongoose.Types.ObjectId
  editPrompt?: string
  enabled: boolean
  onSuccess?: (article: Article) => void
  model?: string
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const { error, setError } = useErrorContext()
  useEffect(() => {
    const generateArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const requestBody: Record<string, string> = {
          editPrompt,
        }

        if (_id) {
          requestBody._id = _id.toString()
        }

        if (model) {
          requestBody.model = model
        }

        const res = await axios.post('/api/articles/edit', requestBody)
        const data = res.data
        if (data.error) {
          throw new Error(data.error)
        }
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

    if (editPrompt && _id && enabled) {
      generateArticle()
    }
  }, [editPrompt, _id, enabled])
  return { loading, success }
}
