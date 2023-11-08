import Logo from '@/components/Logo'
import Article from '@/components/article/Article'
import LampCanvas from '@/components/canvas/Lamp'
import { useGenerateArticle } from '@/lib/useGenerateArticle'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Home = () => {
  const [topic, setTopic] = useState<string | null>(null)
  const router = useRouter()
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = formData.get('topic') as string
    setTopic(text)
  }

  const { article, error, success, loading } = useGenerateArticle({
    topic,
    enabled: !!topic,
    onSuccess: (article) => {
      router.push(`/${article.slug}`)
    },
  })
  return (
    <main className='text-white'>
      <div className='stars'></div>
      <div className='twinkling'></div>
      <div className='clouds'></div>
      <Logo />
      <div className='sm:p-4 text-center space-y-4 absolute top-1/2 left-1/2 transform sm:-translate-x-1/2 sm:-translate-y-2/3 -translate-x-1/2 -translate-y-1/2'>
        <h2 className='sm:p-4 lg:text-5xl sm:text-4xl text-3xl font-bold'>
          Generate expert documentation in{' '}
          <span className='bg-white px-1 bg-opacity-30 leading-normal'>
            minutes
          </span>
          .
        </h2>{' '}
        <p className='sm:p-4 sm:text-base text-sm font-bold'>
          Harness the power of GPT-4 to co-create a custom knowledge base.
          Simply enter a topic and let the AI generate an initial document. Then
          collaborate with GPT-4 to refine and expand the content. Add new
          subarticles to build out a complete tree of in-depth, high-quality
          information tailored to your needs.
        </p>
        <form onSubmit={onFormSubmit}>
          <div className='sm:p-4 flex justify-left md:justify-center md:flex-row flex-col items-center md:space-x-4 space-y-4 md:space-y-0'>
            <input
              className='p-3 border-2 border-gray-300 rounded-lg w-full max-w-lg'
              type='text'
              name='topic'
              placeholder='Ex. JavaScript Arrays'
            />
            <button
              className='p-3 border-2 border-gray-300 rounded-lg gradient-button md:w-auto w-full'
              type='submit'
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Go!'}
            </button>
          </div>
        </form>
      </div>
      <div className='p-4 absolute top-0 left-0 w-full h-full -z-10'>
        <LampCanvas />
      </div>
      <footer className='p-4 text-xs font-bold absolute bottom-0'>
        <p>Made by josiah hawkins</p>
        <p>
          3D model by{' '}
          <a href='https://sketchfab.com/RafaelScopel'>RafaelScopel</a>
        </p>
      </footer>
    </main>
  )
}

export default Home
