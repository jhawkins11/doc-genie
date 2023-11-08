import Article from '@/types/Article'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const useFetchArticle = (slug: string | null) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState<boolean>(false)
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      const res = await axios.get('/api/getArticle', {
        params: {
          slug,
        },
      })
      const data = res.data
      if (data.error) {
        setError(data.error)
        throw new Error(data.error)
      }
      setLoading(false)
      setArticle(data as Article)
      setFetched(true)
    }
    if (slug && !fetched) {
      fetchArticle()
    }
  }, [slug, fetched])

  return { article, loading, error, invalidate: () => setFetched(false) }
}
