import { useErrorContext } from '@/lib/contexts/ErrorContext'
import Article from '@/types/Article'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const useFetchArticle = (slug: string | null) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [fetched, setFetched] = useState<boolean>(false)
  const { error, setError } = useErrorContext()
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/articles/${slug}`)
        const data = res.data
        if (data.error) {
          setError(data.error)
          throw new Error(data.error)
        }
        setLoading(false)
        setArticle(data as Article)
        setFetched(true)
      } catch (err) {
        setError(err as any)
        setLoading(false)
      }
    }
    if (slug && !fetched) {
      fetchArticle()
    }
  }, [slug, fetched])

  return { article, loading, error, invalidate: () => setFetched(false) }
}
