import Logo from '@/components/common/Logo'
import AuthModal from '@/components/auth/AuthModal'
import Image from 'next/image'
import {
  FormEventHandler,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { useRouter } from 'next/router'
import ModelSelect from '@/components/common/ModelSelect'
import {
  DocumentIcon,
  CodeBracketsIcon,
  MagicWandIcon,
} from '@/components/FloatingIcons'
import axios from 'axios'
import ArticleType from '@/types/Article'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import { useSyncWithLocalStorage } from '@/hooks/useSyncWithLocalStorage'
import { useGenerateArticle } from '@/hooks/useGenerateArticle'
import RateLimitModal from '@/components/common/RateLimitModal'

/**
 * Home page component featuring a documentation generator interface.
 * Handles form submission, user authentication, and visual effects.
 */
const Home = () => {
  const [topic, setTopic] = useState('')
  const [model, setModel] = useSyncWithLocalStorage(
    'model',
    'perplexity/sonar-pro'
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [topicToGenerate, setTopicToGenerate] = useState<string | null>(null)
  const [showRateLimitModal, setShowRateLimitModal] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isGuest: boolean
    message: string
  } | null>(null)
  const router = useRouter()
  const [user] = useAuthState(auth)

  // Helper function to trigger auth modal
  const triggerAuthModal = useCallback(() => {
    const authButton = document.getElementById('auth-button')
    if (authButton) {
      authButton.click()
    }
  }, [])

  const handleRateLimit = useCallback(
    (isGuestUser: boolean, message: string) => {
      setRateLimitInfo({ isGuest: isGuestUser, message })
      setShowRateLimitModal(true)
      setTopicToGenerate(null)
      setIsLoading(false)
    },
    []
  )

  // Close rate limit modal when guest user signs in
  useEffect(() => {
    if (user && showRateLimitModal && rateLimitInfo?.isGuest) {
      setShowRateLimitModal(false)
      setRateLimitInfo(null)
    }
  }, [user, showRateLimitModal, rateLimitInfo?.isGuest])

  const particleData = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 6,
        animationDuration: 8 + Math.random() * 4,
      })),
    []
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX * 0.05, y: e.clientY * 0.05 })
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSuccess = useCallback(
    (article: ArticleType) => {
      setTopicToGenerate(null)
      setIsLoading(false)
      setError(null)
      router.push(`/${article.slug}`)
    },
    [router]
  )

  const { article, loading: generatingArticle } = useGenerateArticle({
    topic: topicToGenerate,
    enabled: !!topicToGenerate,
    model,
    onSuccess: handleSuccess,
    onRateLimit: handleRateLimit,
  })

  /**
   * Handles form submission to generate documentation.
   * Validates input, checks authentication, and calls API endpoint.
   */
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError(null)

    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setIsLoading(true)
    setTopicToGenerate(topic.trim())
  }

  // Update loading state based on article generation
  useEffect(() => {
    if (generatingArticle) {
      setIsLoading(true)
    } else if (!generatingArticle && topicToGenerate && !article) {
      setIsLoading(false)
    }
  }, [generatingArticle, topicToGenerate, article])

  // Reset states when generation completes successfully
  useEffect(() => {
    if (article && topicToGenerate) {
      setTopicToGenerate(null)
      setIsLoading(false)
      setError(null)
    }
  }, [article, topicToGenerate])

  return (
    <main className='home-page min-h-screen text-white flex flex-col overflow-hidden relative'>
      <div
        className='cursor-dot'
        style={{ left: cursorPosition.x, top: cursorPosition.y }}
      />
      <div
        className='cursor-outline'
        style={{ left: cursorPosition.x, top: cursorPosition.y }}
      />

      <div className='fixed inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' />
        <div className='absolute inset-0 bg-gradient-to-tr from-blue-600/15 via-purple-600/15 to-pink-600/15 animate-pulse-slow' />
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob' />
          <div className='absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000' />
          <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000' />
        </div>
      </div>

      <div className='fixed inset-0 z-0'>
        {particleData.map((particle) => (
          <div
            key={particle.id}
            className='absolute animate-float-magical'
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          >
            <div
              className='w-1 h-1 bg-white/20 rounded-full'
              style={{ boxShadow: '0 0 2px rgba(255,255,255,0.1)' }}
            />
          </div>
        ))}
      </div>

      <div
        className='fixed inset-0 pointer-events-none z-10'
        style={{ left: mousePosition.x - 192, top: mousePosition.y - 192 }}
      />

      <header className='fixed top-0 left-0 right-0 z-50 transition-all duration-500'>
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm' />
        <nav className='relative bg-black/10 backdrop-blur-2xl border-b border-white/5'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent' />
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center h-16 sm:h-20'>
              <Logo />
              <div className='flex items-center space-x-3 sm:space-x-6'>
                <div className='relative group'>
                  <div className='absolute -inset-px bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow' />
                  <div className='relative'>
                    <AuthModal fixedButton={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent' />
        </nav>
      </header>

      <div className='h-16 sm:h-32' />

      <section className='flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10'>
        <div className='w-full lg:w-3/5 space-y-6 sm:space-y-8 text-center lg:text-left mb-12 sm:mb-16 lg:mb-0 lg:pr-8 xl:pr-12'>
          <div className='space-y-4 sm:space-y-6'>
            <h1 className='text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl font-black leading-tight sm:leading-snug tracking-tight'>
              <span className='block text-white drop-shadow-lg'>Generate</span>
              <span className='inline-block md:block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg'>
                expert
              </span>{' '}
              <span className='inline-block md:block bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-lg'>
                documentation
              </span>
              <span className='block text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl mt-3 sm:mt-4 text-white'>
                with a wish
                <span className='text-yellow-400 animate-pulse ml-1 sm:ml-2'>
                  ✨
                </span>
              </span>
            </h1>
          </div>

          <div className='space-y-3 sm:space-y-4'>
            <p className='text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-blue-100/90 tracking-wide'>
              Instant, structured, and magical.
            </p>
            <p className='text-base sm:text-lg md:text-xl text-gray-300/80 max-w-xl sm:max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0'>
              Use AI to turn any topic into a full documentation tree in
              seconds. Just type a topic and let Doc Genie do the rest.
            </p>
          </div>

          <div className='pt-6 sm:pt-8 w-full'>
            <form
              onSubmit={handleSubmit}
              className='space-y-4 sm:space-y-6 max-w-3xl mx-auto lg:mx-0 px-2 sm:px-0'
            >
              <div className='relative group'>
                <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 group-focus-within:opacity-40 transition duration-1000'></div>
                <input
                  type='text'
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder='Ex: How Promises Work In JavaScript'
                  className='relative w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 outline-none placeholder-gray-400 transition-all duration-300 hover:bg-black/50 text-white'
                  disabled={isLoading}
                />
              </div>

              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                <div className='flex-1 relative group'>
                  <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-15 group-hover:opacity-25 transition duration-1000'></div>
                  <ModelSelect
                    model={model}
                    setModel={setModel}
                    className='relative w-full text-sm sm:text-base py-3 sm:py-4 px-4 sm:px-5 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-400/50'
                    disabled={isLoading}
                  />
                </div>

                <div className='relative group'>
                  <div className='absolute -inset-1 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000'></div>
                  <button
                    type='submit'
                    className='relative px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] sm:min-w-[140px] w-full sm:w-auto'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className='animate-spin mr-3 h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className='p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl'>
                  <p className='text-red-300 text-center'>{error}</p>
                </div>
              )}
            </form>
          </div>

          <div className='flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 pt-6 sm:pt-8 px-2 sm:px-0'>
            {[
              { icon: '🔒', text: 'Secure & Private' },
              { icon: '⚡', text: 'First Draft in Seconds' },
              { icon: '📝', text: 'Structured Markdown Output' },
            ].map((feature, index) => (
              <div
                key={index}
                className='flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105'
              >
                <span className='text-base sm:text-lg'>{feature.icon}</span>
                <span className='text-xs sm:text-sm font-medium text-gray-200'>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='w-full lg:w-2/5 flex justify-center items-center relative mt-12 sm:mt-16 lg:mt-0 mb-8 lg:mb-0'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent lg:hidden'></div>

          <div className='relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-lg mx-auto lg:ml-8 xl:ml-12'>
            <div className='absolute inset-0 bg-gradient-to-r from-yellow-400/15 via-orange-400/20 to-red-400/15 rounded-full filter blur-3xl animate-pulse-slow'></div>
            <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-black/30 rounded-full filter blur-2xl opacity-60'></div>
            <div className='absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/30 to-red-400/20 rounded-full filter blur-2xl animate-pulse-slow'></div>
            <div className='absolute inset-0 z-20 hidden sm:block'>
              <div className='absolute left-[-17%] top-[19%] animate-float-slow'>
                <div className='p-2 sm:p-3 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg text-blue-300'>
                  <DocumentIcon className='w-6 h-6 sm:w-8 sm:h-8 text-blue-300' />
                </div>
              </div>
              <div className='absolute left-[-20%] top-[-15%] animate-float-medium'>
                <div className='p-2 sm:p-3 bg-gradient-to-br from-green-400/20 to-teal-400/20 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg text-green-300'>
                  <CodeBracketsIcon className='w-6 h-6 sm:w-8 sm:h-8 text-green-300' />
                </div>
              </div>
              <div className='absolute left-[5%] top-[0%] animate-float-fast'>
                <div className='p-2 sm:p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg text-purple-300'>
                  <MagicWandIcon className='w-6 h-6 sm:w-8 sm:h-8 text-purple-300' />
                </div>
              </div>
            </div>
            <div className='absolute left-[35%] top-[-12%] sm:top-[3%] transform -translate-x-1/2 w-12 sm:w-2 h-48 sm:h-64 smoke-trail-container opacity-60 sm:opacity-100'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`smoke-trail smoke-trail-${(i % 3) + 1}`}
                  style={{
                    left: `${i * -1.5}px`,
                    width: `${3 + i * 1.2}px`,
                    height: `${45 + i * 12}px`,
                    animationDelay: `${i * 0.4}s`,
                    transform: `rotate(${(Math.random() - 0.5) * 8}deg)`,
                  }}
                />
              ))}
            </div>
            <div className='relative z-10 transform hover:scale-105 transition-transform duration-500'>
              <div className='absolute inset-0 bg-gradient-to-b from-yellow-400/20 to-orange-600/30 rounded-full filter blur-xl'></div>
              <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2/3 h-6 bg-black/40 rounded-full filter blur-xl opacity-70'></div>
              <Image
                src='/lamp.png'
                alt='Magic Lamp'
                width={400}
                height={480}
                className='w-full h-auto object-contain relative z-10 filter drop-shadow-2xl'
                priority
                style={{
                  filter:
                    'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.8)) drop-shadow(0 10px 25px rgba(255, 165, 0, 0.4))',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className='w-full py-16 sm:py-20 lg:py-24 relative z-10'>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 backdrop-blur-sm' />
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
            {[
              {
                iconSrc: '/icons/quill.svg',
                title: 'Summon',
                description:
                  'Type a topic. Doc Genie understands your needs instantly and prepares to create magic.',
                gradient: 'from-blue-500 to-purple-500',
              },
              {
                iconSrc: '/icons/doc.svg',
                title: 'Create',
                description:
                  'AI generates clean, structured documentation with examples, diagrams, and comprehensive subtopics.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                iconSrc: '/icons/doc-tree.svg',
                title: 'Customize',
                description:
                  'Add your personal style. Edit sections or regenerate parts collaboratively with precision.',
                gradient: 'from-pink-500 to-orange-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className='group relative p-6 sm:p-8 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-black/30 hover:border-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

                <div className='relative z-10 text-center space-y-3 sm:space-y-4'>
                  <div
                    className={`inline-flex p-6 sm:p-8 bg-gradient-to-r ${feature.gradient} rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Image
                      src={feature.iconSrc}
                      alt={feature.title}
                      width={64}
                      height={64}
                      className='w-12 h-12 sm:w-16 sm:h-16 filter brightness-0 invert'
                    />
                  </div>

                  <h3 className='text-xl sm:text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300'>
                    {feature.title}
                  </h3>

                  <p className='text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showRateLimitModal && (
        <RateLimitModal
          isOpen={showRateLimitModal}
          isGuest={rateLimitInfo?.isGuest ?? true}
          onClose={() => setShowRateLimitModal(false)}
          onSignUp={triggerAuthModal}
          isDarkMode={false}
        />
      )}
    </main>
  )
}

export default Home
