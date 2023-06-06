import axios from 'axios'
import { useState, useEffect } from 'react'

export const useGenerateArticle = (
  topic: string | null,
  subtopic?: string | null
) => {
  const [article, setArticle] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const generateArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(
          'https://bqasbbolzxmk4zoyhwqavvde7u0jjvtk.lambda-url.us-east-1.on.aws/',
          {
            params: {
              topic,
              subtopic,
            },
          }
        )
        const data = res.data
        console.log(data)
        if (data.error) {
          throw new Error(data.error)
        }
        setArticle(data)
      } catch (err) {
        setError((err as any).message)
      } finally {
        setLoading(false)
        setSuccess(true)
      }
    }

    if (topic) {
      generateArticle()
    }
  }, [topic])
  return { article, loading, error, success }
}
