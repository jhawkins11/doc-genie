import React, { useEffect, useState, useCallback, useMemo } from 'react'
import styles from './Article.module.css'
import { useGenerateArticle } from '@/hooks/useGenerateArticle'
import Logo from '../common/Logo'
import {
  Box,
  InputAdornment,
  List,
  Skeleton,
  TextField,
  useMediaQuery,
} from '@mui/material'
import {
  Check,
  Close,
  Info,
  Menu,
  DarkMode,
  LightMode,
} from '@mui/icons-material'
import type Article from '@/types/Article'
import ArticleList from '../ArticleList/ArticleList'
import ResponsiveDrawer from '../common/ResponsiveDrawer/ResponsiveDrawer'
import { useEditArticle } from '@/hooks/useEditArticle'
import LoadingBackdrop from '../common/LoadingBackdrop'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import StyledButton from '../common/StyledButton'
import AuthModal from '../auth/AuthModal'
import ArticleContent from '../common/ArticleContent/ArticleContent'
import OnThisPage from '../common/OnThisPage/OnThisPage'
import { useSyncWithLocalStorage } from '@/hooks/useSyncWithLocalStorage'
import ModelSelect from '../common/ModelSelect'
import { useDarkMode } from '@/contexts/DarkModeContext'
import GuestPromptBanner from '../guests/GuestPromptBanner'
import ActionGuidanceModal from '../guests/ActionGuidanceModal'
import { useGuestDetection } from '@/hooks/useGuestDetection'
import RateLimitModal from '../common/RateLimitModal'

const Article = React.memo(
  ({
    articles,
    loading,
    invalidate,
  }: {
    articles: Article[]
    loading: boolean
    invalidate: () => void
  }) => {
    const [selected, setSelected] = useState<Article>(articles?.[0])
    const [editPrompt, setEditPrompt] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isViewMode, setIsViewMode] = useState<boolean>(false)
    const [articleToEdit, setArticleToEdit] = useState<Article | null>(null)
    const [articleToGenerate, setArticleToGenerate] = useState<string | null>(
      null
    )
    const [model, setModel] = useSyncWithLocalStorage<string>(
      'model',
      'perplexity/sonar-pro'
    )

    const { isDarkMode, toggleDarkMode } = useDarkMode()

    const [user] = useAuthState(auth)
    const isSmallScreen = useMediaQuery('(max-width:900px)')

    // Guest detection and modal state
    const { isGuest, isGuestArticle } = useGuestDetection()
    const [showActionModal, setShowActionModal] = useState(false)
    const [showRateLimitModal, setShowRateLimitModal] = useState(false)
    const [rateLimitInfo, setRateLimitInfo] = useState<{
      isGuest: boolean
      message: string
    } | null>(null)

    // Helper function to trigger auth modal
    const triggerAuthModal = useCallback(() => {
      const authButton = document.getElementById('auth-button')
      if (authButton) {
        authButton.click()
      }
    }, [])

    // Handle rate limit errors
    const handleRateLimit = useCallback(
      (isGuestUser: boolean, message: string) => {
        setRateLimitInfo({ isGuest: isGuestUser, message })
        setShowRateLimitModal(true)
        // Clear the loading state when rate limit is hit
        setArticleToGenerate(null)
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

    const handleGenerateSuccess = useCallback(() => {
      setArticleToGenerate(null)
      invalidate()
    }, [invalidate])

    const handleEditSuccess = useCallback(() => {
      setArticleToEdit(null)
      setEditPrompt(null)
      invalidate()
    }, [invalidate])

    useGenerateArticle({
      topic:
        selected?._id === articles?.[0]?._id
          ? articles?.[0]?.title
          : `${articles?.[0]?.title}: ${selected?.title}`,
      subtopic: articleToGenerate,
      parentid: selected?._id,
      enabled: !!articleToGenerate,
      userId: user?.uid,
      model,
      onSuccess: handleGenerateSuccess,
      onRateLimit: handleRateLimit,
    })

    useEditArticle({
      _id: articleToEdit?._id,
      editPrompt,
      onSuccess: handleEditSuccess,
      enabled: !!articleToEdit,
      model,
    })

    useEffect(() => {
      // when the article changes, set articleToGenerate to null to stop the loading animation
      setArticleToGenerate(null)
      setArticleToEdit(null)
      // find selected article in the article tree so the content will up to date
      const findSelected = (article: Article) => {
        if (article._id === selected?._id) {
          setSelected(article)
        }
        if (article.childArticles.length > 0) {
          article.childArticles.forEach((subarticle) => {
            findSelected(subarticle)
          })
        }
      }
      if (articles?.length > 0 && selected) {
        findSelected(articles?.[0])
      } else if (articles?.length > 0) {
        setSelected(articles?.[0])
      }
    }, [articles])

    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen)
    }
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
      <div
        className={`${styles.container} ${
          isDarkMode ? styles.darkContainer : styles.lightContainer
        }`}
      >
        <LoadingBackdrop loading={loading} />
        <nav
          className={`${styles.mobileNav} ${
            isDarkMode ? '' : styles.lightMobileNav
          }`}
        >
          <Logo />
          <Menu
            onClick={handleDrawerToggle}
            color='inherit'
            className={styles.menuIcon}
          />
        </nav>
        <Box
          sx={{ width: { sm: 300 }, flexShrink: { sm: 0 } }}
          component={'nav'}
        >
          <ResponsiveDrawer
            mobileOpen={mobileOpen || !!articleToGenerate}
            setMobileOpen={setMobileOpen}
            isDarkMode={isDarkMode}
          >
            <Logo />
            {articles.length > 0 && selected ? (
              <List>
                {articles.map((article) => (
                  <ArticleList
                    key={article._id as unknown as string}
                    article={article}
                    setSelected={setSelected}
                    setArticleToGenerate={setArticleToGenerate}
                    selected={selected}
                    isGenerating={!!articleToGenerate}
                    articleToEdit={articleToEdit}
                    mode={
                      articles.length > 1
                        ? 'preview'
                        : isViewMode
                        ? 'view'
                        : 'edit'
                    }
                  />
                ))}
              </List>
            ) : (
              // placeholder
              <Skeleton
                variant='rectangular'
                height={100}
                width={230}
                sx={{
                  margin: '0 auto',
                  borderRadius: '10px',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(51, 51, 51, 0.8), rgba(68, 68, 68, 0.6))'
                    : 'linear-gradient(135deg, rgba(226, 232, 240, 0.8), rgba(203, 213, 225, 0.6))',
                }}
              />
            )}
            {articles?.length < 2 && !isViewMode ? (
              <p className='text-center text-gray-100 dark:text-gray-400 text-xs mt-4 w-4/5 mx-auto opacity-60'>
                <Info className='inline-block mr-1 w-3 h-3' />
                Click a lamp or + icon to generate a sub-article
              </p>
            ) : (
              <p></p>
            )}
            <div className='grid grid-cols-3 gap-2 px-4 mb-5 h-auto content-end w-full self-end'>
              <StyledButton
                text={isViewMode ? 'Edit' : 'View'}
                theme='gradient'
                variant='contained'
                className='!text-sm !mt-0 h-full w-20'
                onClick={() => {
                  setIsViewMode(!isViewMode)
                }}
              />
              <ModelSelect
                model={model}
                setModel={setModel}
                className='text-gray-600 dark:text-gray-300'
              />
            </div>
            <div className='px-4 mb-4 w-full flex justify-center'>
              <AuthModal
                fixedButton={false}
                isDarkMode={isDarkMode}
                compact={true}
              />
            </div>
            <div className='px-4 pb-2 w-full'>
              <StyledButton
                text={isDarkMode ? 'Light Mode' : 'Dark Mode'}
                theme={isDarkMode ? 'light' : 'dark'}
                variant='contained'
                className='!text-sm !mt-0 w-full'
                startIcon={isDarkMode ? <LightMode /> : <DarkMode />}
                onClick={toggleDarkMode}
                title='Toggle between light and dark mode. '
              />
            </div>
          </ResponsiveDrawer>
        </Box>
        <Box
          component={'main'}
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Box
            component={'article'}
            sx={{
              width: '100%',
              // 800-1200px is max recommended line length for readability: https://www.newtarget.com/web-insights-blog/max-content-width/
              maxWidth: '1000px',
              padding: '0 2rem',
              bgcolor: 'transparent',
            }}
          >
            <div
              className={`${styles.content} ${
                isDarkMode ? '' : styles.lightContent
              }`}
            >
              <div
                className={`${styles.root} ${
                  isDarkMode ? styles.darkMode : styles.lightMode
                }`}
                id='article'
              >
                <ArticleContent
                  selected={selected}
                  setArticleToGenerate={setArticleToGenerate}
                  viewOnly={articles.length > 1 || isViewMode}
                  showLink={articles.length > 1}
                  articles={articles}
                />

                {/* Guest Prompt Banner */}
                {isGuest && selected && isGuestArticle(selected) && (
                  <GuestPromptBanner
                    message='Sign up to save your work permanently and unlock more article generations!'
                    ctaText='Sign Up Now'
                    onCtaClick={triggerAuthModal}
                    variant='incentive'
                    isDarkMode={isDarkMode}
                  />
                )}

                {isEditing ? (
                  <TextField
                    variant='filled'
                    label='Edit prompt'
                    sx={{
                      width: '100%',
                      mt: 4,
                      display: isEditing ? 'grid' : 'none',
                      '& .MuiFilledInput-root': {
                        background: isDarkMode
                          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.6))'
                          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                          isDarkMode
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'rgba(0, 0, 0, 0.1)'
                        }`,
                        borderRadius: '12px',
                        '&:hover': {
                          background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.7))'
                            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.7))',
                          borderColor: 'rgba(251, 191, 36, 0.3)',
                        },
                        '&.Mui-focused': {
                          background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.8))'
                            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.8))',
                          borderColor: 'var(--accent-gold)',
                          boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                        '&.Mui-focused': {
                          color: 'var(--accent-gold)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      },
                    }}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditing(false)
                        setArticleToEdit(selected)
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Close
                            onClick={() => {
                              setEditPrompt(null)
                              setIsEditing(false)
                            }}
                            sx={{
                              color: '#ef4444',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                color: '#dc2626',
                                filter:
                                  'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))',
                              },
                            }}
                          />
                          <Check
                            sx={{
                              color: 'var(--accent-gold)',
                              cursor: 'pointer',
                              ml: 1,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                filter:
                                  'drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))',
                              },
                            }}
                            onClick={() => {
                              setIsEditing(false)
                              setArticleToEdit(selected)
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : selected && !isViewMode ? (
                  <div
                    className={`${styles.edit} ${
                      isDarkMode ? '' : styles.lightEdit
                    }`}
                  >
                    <StyledButton
                      onClick={() => {
                        if (isGuest) {
                          setShowActionModal(true)
                        } else {
                          setIsEditing(true)
                        }
                      }}
                      text='Edit With GPT'
                      theme='light'
                      variant='contained'
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Box>

          {!isSmallScreen && selected && (
            <Box
              sx={{
                width: '280px',
                flexShrink: 0,
                padding: '0 1rem',
                display: { xs: 'none', lg: 'block' },
              }}
            >
              <OnThisPage content={selected.content} isDarkMode={isDarkMode} />
            </Box>
          )}
        </Box>

        <ActionGuidanceModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title='Account Required'
          message="Editing requires an account to ensure your changes are saved securely. Please use the 'Sign In' button in the sidebar to create an account or log in."
          primaryAction={{
            text: 'Got it',
            onClick: () => setShowActionModal(false),
          }}
          isDarkMode={isDarkMode}
        />

        {/* Rate Limit Modal */}
        <RateLimitModal
          isOpen={showRateLimitModal}
          onClose={() => setShowRateLimitModal(false)}
          isGuest={rateLimitInfo?.isGuest ?? true}
          onSignUp={triggerAuthModal}
          isDarkMode={isDarkMode}
        />
      </div>
    )
  }
)

Article.displayName = 'Article'

export default Article
