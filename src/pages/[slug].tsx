import Article from '@/components/Article/Article'
import { useFetchArticles } from '@/hooks/useFetchArticles'
import { useRouter } from 'next/router'
import React from 'react'

const ArticleView = () => {
  const router = useRouter()
  const { slug } = router.query

  const {
    articles,
    loading: fetchLoading,
    error: fetchError,
    invalidate,
  } = useFetchArticles(slug as string, null)

  const articleToDisplay = articles && articles.length > 0 ? articles[0] : null

  const overallLoading = fetchLoading

  if (fetchError && !overallLoading) {
    return (
      <div className='text-red-500 p-4'>
        Error loading article: {fetchError.message}
      </div>
    )
  }

  if (!articleToDisplay && !overallLoading && !fetchError) {
    return <div className='p-4'>Article not found.</div>
  }

  return (
    <Article
      articles={articleToDisplay ? [articleToDisplay] : []}
      loading={overallLoading}
      invalidate={invalidate}
    />
  )
}

export default ArticleView
