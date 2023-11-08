import Article from '@/types/Article'
import axios from 'axios'
import mongoose from 'mongoose'
import { useState, useEffect } from 'react'

export const useEditArticle = ({
  _id,
  editPrompt,
  enabled = true,
  onSuccess,
}: {
  _id?: mongoose.Types.ObjectId
  editPrompt?: string
  enabled: boolean
  onSuccess?: (article: Article) => void
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const generateArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.post('/api/editArticle', {
          _id: _id,
          editPrompt,
        })
        const data = res.data
        if (data.error) {
          throw new Error(data.error)
        }
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

    if (editPrompt && _id && enabled) {
      generateArticle()
    }
  }, [editPrompt, _id, enabled])
  return { loading, error, success }
}
