import Article from '@/components/article/Article'
import { useFetchArticle } from '@/lib/useFetchArticle'
import { useGenerateArticle } from '@/lib/useGenerateArticle'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

const ArticleView = () => {
  const router = useRouter()
  const { id } = router.query
  const [childId, setChildId] = useState<number | null>(null)

  const { article, loading, error, invalidate } = useFetchArticle(
    childId || Number(id),
    childId ? Number(id) : null
  )
  if (article) {
    return (
      <Article article={article} loading={loading} invalidate={invalidate} />
    )
  }
  return null
}

export default ArticleView
