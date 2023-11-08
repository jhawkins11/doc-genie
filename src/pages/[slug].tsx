import Article from '@/components/Article/Article'
import { useFetchArticle } from '@/hooks/useFetchArticle'
import { useRouter } from 'next/router'
import React from 'react'

const ArticleView = () => {
  const router = useRouter()
  const { slug } = router.query
  const { article, loading, error, invalidate } = useFetchArticle(
    slug as string
  )
  if (article) {
    return (
      <Article article={article} loading={loading} invalidate={invalidate} />
    )
  }
  return null
}

export default ArticleView
