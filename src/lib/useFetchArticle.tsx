import axios from 'axios'
import { useEffect, useState } from 'react'
import { Article } from './useGenerateArticle'

export const useFetchArticle = (id: number | null, parentid: number | null) => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState<boolean>(false)
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      const res = await axios.get(
        'https://6qmmcazyacyt5bla7r7fxvpasm0kpyyh.lambda-url.us-east-1.on.aws/',
        {
          params: {
            id,
            parentid: parentid || undefined,
          },
        }
      )
      const data = res.data
      console.log(data)
      if (data.error) {
        setError(data.error)
        throw new Error(data.error)
      }
      setArticle(data as Article)
      setLoading(false)
      setFetched(true)
    }
    if (id) {
      fetchArticle()
    }
  }, [id, parentid, fetched])

  return { article, loading, error, invalidate: () => setFetched(false) }
}
