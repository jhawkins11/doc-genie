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
    <main className='text-white min-h-screen relative overflow-hidden'>
      <div className='stars'></div>
      <div className='twinkling'></div>
      <div className='clouds'></div>
      <div className='absolute top-0 left-0 z-10'>
        <Logo />
      </div>
      <AuthModal />
      <div className='flex items-center justify-center min-h-screen'>
        <div
          className={`sm:p-6 text-center space-y-6 glass rounded-xl max-w-3xl w-full p-8 sm:p-10 lg:p-12 animate-scale-in z-10 border border-white border-opacity-10 shadow-2xl animate-border-pulse gradient-overlay`}
        >
          <h2
            className='sm:p-4 lg:text-5xl sm:text-4xl text-3xl font-bold animate-staggered-children tracking-tight text-shadow-md'
            aria-label='title'
          >
            <span className='title-word animate-fade-in opacity-0 inline-block text-white'>
              Generate
            </span>{' '}
            <span className='title-word animate-fade-in opacity-0 inline-block'>
              expert
            </span>{' '}
            <span className='title-word animate-fade-in opacity-0 inline-block'>
              documentation
            </span>{' '}
            <span className='title-word animate-fade-in opacity-0 inline-block'>
              in
            </span>{' '}
            <span className='bg-white px-2 py-1 bg-opacity-20 rounded-md leading-normal title-word animate-fade-in opacity-0 inline-block shadow-lg'>
              minutes
            </span>
            <span className='text-accent-gold animate-glow'>.</span>
          </h2>{' '}
          <p
            className='sm:p-4 sm:text-lg text-base animate-fade-in opacity-0 text-gray-200 leading-relaxed max-w-2xl mx-auto text-shadow-sm'
            style={{ animationDelay: '0.6s' }}
            aria-label='description'
          >
            Harness the power of GPT to co-create a custom knowledge base.
            Simply enter a topic and let the AI generate an initial document.
            Then collaborate with GPT to refine and expand the content. Add new
            subarticles to build out a complete tree of in-depth, high-quality
            information tailored to your needs.
          </p>
          <form
            onSubmit={onFormSubmit}
            className='animate-fade-in opacity-0'
            style={{ animationDelay: '0.8s' }}
          >
            <div className='sm:p-4 flex justify-left md:justify-center md:flex-row flex-col items-center md:space-x-6 space-y-4 md:space-y-0'>
              <input
                aria-label='topic'
                className='p-4 border-2 border-gray-600 rounded-lg w-full max-w-lg hover-lift focus:border-accent-gold transition-all duration-300 glass text-white placeholder-gray-400 shadow-inner'
                type='text'
                name='topic'
                placeholder='Ex. JavaScript Arrays'
              />
              <div className='grid grid-cols-3 gap-4 w-full grid-template-columns max-w-lg'>
                <ModelSelect model={model} setModel={setModel} />
                <button
                  className='p-4 border-none rounded-lg gradient-button md:w-auto w-full animated-button max-w-lg hover:scale-105 transition-transform duration-300 shadow-lg text-lg font-semibold bg-pan text-shadow-sm'
                  type='submit'
                  title='Generate'
                  disabled={loading}
                >
                  {(loading || success) && (
                    <LinearProgress
                      variant='determinate'
                      value={
                        success
                          ? 100
                          : model === 'gpt-3.5-turbo' || model === 'gpt-4o'
                          ? ((10 - secondsLeft) / 5) * 100
                          : ((45 - secondsLeft) / 30) * 100
                      }
                      className='absolute top-0 left-0 w-full h-full bg-black opacity-50 rounded-lg'
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
      </div>
      <div className='fixed inset-0 -z-10'>
        <LampCanvas />
      </div>
      <footer className='p-4 text-xs font-bold absolute bottom-0 left-0 animate-pulse-subtle text-gray-300 text-shadow-sm'>
        <p>Made by josiah hawkins</p>
        <p>
          3D model by{' '}
          <a
            href='https://sketchfab.com/RafaelScopel'
            className='hover:text-accent-gold transition-colors duration-300'
          >
            RafaelScopel
          </a>
        </p>
      </footer>
    </main>
  )
}

export default Home
