import Article from '@/components/article/Article'
import { useGenerateArticle } from '@/lib/useGenerateArticle'
import { useRouter } from 'next/router'
import React from 'react'

const ArticleView = () => {
  const router = useRouter()
  const { id: text } = router.query

  const { article, loading, error, success } = useGenerateArticle(
    text as string
  )
  if (loading) {
    return (
      <h1 className='text-3xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        {/* generating with dots appearing one after the other */}
        Generating...
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
  if (!article) {
    return (
      <h1 className='text-3xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
        No article found
      </h1>
    )
  }
  if (success) {
    return <Article mdl={article} />
  }
  return null
}

export default ArticleView
