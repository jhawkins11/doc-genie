import Article from '@/components/article/Article'
import { useFetchArticle } from '@/lib/useFetchArticle'
import { useGenerateArticle } from '@/lib/useGenerateArticle'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

const ArticleView = () => {
  const router = useRouter()
  const { id } = router.query
  const [childId, setChildId] = useState<number | null>(null)

  const { article, loading, error } = useFetchArticle(
    childId || Number(id),
    childId ? Number(id) : null
  )
  if (loading) {
    return (
      <h1 className='text-3xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        Loading...
      </h1>
    )
  }
  if (error) {
    return (
      <h1 className='text-3xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        Error: {error}
      </h1>
    )
  }
  if (!article?.content) {
    return (
      <h1 className='text-3xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        No article found
      </h1>
    )
  }
  if (article) {
    return (
      <Article
        mdl={article.content.trim()}
        id={article.id}
        parentid={Number(id)}
        setChildId={setChildId}
      />
    )
  }
  return null
}

export default ArticleView
