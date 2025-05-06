import Logo from '@/components/common/Logo'
import LampCanvas from '@/components/Lamp/Lamp'
import { useGenerateArticle } from '@/hooks/useGenerateArticle'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AuthModal from '@/components/auth/AuthModal'
import { auth } from '@/lib/initializeFirebaseApp'
import { useAuthState } from 'react-firebase-hooks/auth'
import { CircularProgress, LinearProgress } from '@mui/material'
import { useSyncWithLocalStorage } from '@/hooks/useSyncWithLocalStorage'
import ModelSelect from '@/components/common/ModelSelect'
import { Check } from '@mui/icons-material'

const Home = () => {
  const [topic, setTopic] = useState<string | null>(null)
  const [model, setModel] = useSyncWithLocalStorage<string>('model', 'gpt-4o')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const [user] = useAuthState(auth)

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = formData.get('topic') as string
    setTopic(text)
    setSecondsLeft(model === 'gpt-3.5-turbo' || model === 'gpt-4o' ? 10 : 45)
  }

  const { loading } = useGenerateArticle({
    topic,
    enabled: !!topic,
    model,
    userId: user?.uid,
    onSuccess: (article) => {
      setSuccess(true)
      // wait 1 second before redirecting to give the user a chance to see the success message
      setTimeout(() => router.push(`/${article.slug}`), 1000)
    },
  })

  // countdown timer for loading button
  // updates every tenth of a second
  useEffect(() => {
    const interval = setInterval(() => {
      if (secondsLeft > 0) {
        setSecondsLeft(secondsLeft - 0.1)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [secondsLeft])

  return (
    <main className='text-white'>
      <div className='stars'></div>
      <div className='twinkling'></div>
      <div className='clouds'></div>
      <Logo />
      <AuthModal />
      <div
        className={`sm:p-4 text-center space-y-4 absolute top-1/2 left-1/2 
        transform sm:-translate-x-1/2 sm:-translate-y-1/2 -translate-x-1/2 -translate-y-1/2 
   bg-black bg-opacity-50 rounded-lg max-w-3xl w-full p-6 sm:p-8 lg:p-12`}
      >
        <h2
          className='sm:p-4 lg:text-5xl sm:text-4xl text-3xl font-bold'
          aria-label='title'
        >
          Generate expert documentation in{' '}
          <span className='bg-white px-1 bg-opacity-30 leading-normal'>
            minutes
          </span>
          .
        </h2>{' '}
        <p className='sm:p-4 sm:text-base text-sm' aria-label='description'>
          Harness the power of GPT to co-create a custom knowledge base. Simply
          enter a topic and let the AI generate an initial document. Then
          collaborate with GPT to refine and expand the content. Add new
          subarticles to build out a complete tree of in-depth, high-quality
          information tailored to your needs.
        </p>
        <form onSubmit={onFormSubmit}>
          <div className='sm:p-4 flex justify-left md:justify-center md:flex-row flex-col items-center md:space-x-4 space-y-4 md:space-y-0'>
            <input
              aria-label='topic'
              className='p-3 border-2 border-gray-300 rounded-lg w-full max-w-lg'
              type='text'
              name='topic'
              placeholder='Ex. JavaScript Arrays'
            />
            <div className='grid grid-cols-3 gap-4 w-full grid-template-columns max-w-lg'>
              <ModelSelect model={model} setModel={setModel} />
              <button
                className='p-3 border-2 border-gray-300 rounded-lg gradient-button md:w-auto w-full animated-button max-w-lg'
                type='submit'
                title='Generate'
                disabled={loading}
              >
                {(loading || success) && (
                  <LinearProgress
                    variant='determinate'
                    // value is determined by the time since the form was submitted and the model selected
                    // if the model is gpt-3.5-turbo, the value is 100% after 5 seconds
                    // if the model is gpt-4-turbo-preview, the value is 100% after 30 seconds
                    value={
                      success
                        ? 100
                        : model === 'gpt-3.5-turbo' || model === 'gpt-4o'
                        ? ((10 - secondsLeft) / 5) * 100
                        : ((45 - secondsLeft) / 30) * 100
                    }
                    className='absolute top-0 left-0 w-full h-full bg-black opacity-50'
                    color='inherit'
                  />
                )}
                {loading ? (
                  <span className='flex items-center justify-center -z-50'>
                    <CircularProgress
                      size={20}
                      color='inherit'
                      className='mr-2'
                    />
                  </span>
                ) : success ? (
                  <Check />
                ) : (
                  'Go!'
                )}
              </button>
            </div>
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
          <a
            href='https://sketchfab.com/RafaelScopel'
            className='hover:text-accent-gold'
          >
            RafaelScopel
          </a>
        </p>
      </footer>
    </main>
  )
}

export default Home
