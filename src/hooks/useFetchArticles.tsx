import { useErrorContext } from '@/lib/contexts/ErrorContext'
import Article from '@/types/Article'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const useFetchArticles = (
  slug: string | null,
  userid: string | null
) => {
  const [articles, setArticles] = useState<Article[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [fetched, setFetched] = useState<boolean>(false)
  const { error, setError } = useErrorContext()
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          userid ? `/api/articles/user/${userid}` : `/api/articles/${slug}`
        )
        const data = res.data
        if (data.error) {
          setError(data.error)
          throw new Error(data.error)
        }
        setLoading(false)
        setArticles(data as Article[])
        setFetched(true)
      } catch (err) {
        setError(err as any)
        setLoading(false)
      }
    }
    if (!fetched && (slug || userid)) {
      fetchArticle()
    }
  }, [slug, fetched, userid])

  return { articles, loading, error, invalidate: () => setFetched(false) }
}
