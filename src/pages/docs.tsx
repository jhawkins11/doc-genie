import React from 'react'
import { useFetchArticles } from '@/hooks/useFetchArticles'
import { useRouter } from 'next/router'
import Article from '@/components/Article/Article'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'

const AllArticlesView = () => {
  const router = useRouter()
  const { slug } = router.query
  const [user] = useAuthState(auth)
  const { articles, loading, error, invalidate } = useFetchArticles(
    null,
    user?.uid
  )

  return (
    <Article
      articles={articles || []}
      loading={loading}
      invalidate={invalidate}
    />
  )
}

export default AllArticlesView
