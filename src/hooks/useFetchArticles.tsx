import { useErrorContext } from '@/lib/contexts/ErrorContext'
import Article from '@/types/Article'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'

export const useFetchArticles = (
  slug: string | null,
  userid: string | null
) => {
  const [articles, setArticles] = useState<Article[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [fetched, setFetched] = useState<boolean>(false)
  const { error, setError } = useErrorContext()
  const [user] = useAuthState(auth)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        if (userid && user) {
          try {
            const idToken = await user.getIdToken()
            headers.Authorization = `Bearer ${idToken}`
          } catch (error) {
            console.warn('Failed to get Firebase ID token:', error)
          }
        }

        const res = await axios.get(
          userid ? `/api/articles/user/${userid}` : `/api/articles/${slug}`,
          { headers }
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
        setError(
          err instanceof Error ? err : new Error('An unexpected error occurred')
        )
        setLoading(false)
      }
    }
    if (!fetched && (slug || userid)) {
      fetchArticle()
    }
  }, [slug, fetched, userid, user])

  return { articles, loading, error, invalidate: () => setFetched(false) }
}
