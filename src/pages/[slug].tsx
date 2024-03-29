import Article from '@/components/Article/Article'
import { useFetchArticles } from '@/hooks/useFetchArticles'
import { useRouter } from 'next/router'
import React from 'react'

const ArticleView = () => {
  const router = useRouter()
  const { slug } = router.query
  const { articles, loading, error, invalidate } = useFetchArticles(
    slug as string,
    null
  )
  return (
    <Article
      articles={articles || []}
      loading={loading}
      invalidate={invalidate}
    />
  )
}

export default ArticleView
