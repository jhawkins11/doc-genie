import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useGenerateArticle } from '@/hooks/useGenerateArticle'
import Logo from '../common/Logo'
import { Box, InputAdornment, TextField } from '@mui/material'
import { Check, Close, CopyAll, Info, Menu } from '@mui/icons-material'
import Article from '@/types/Article'
import ArticleList from '../ArticleList/ArticleList'
import ResponsiveDrawer from '../common/ResponsiveDrawer'
import formatMarkdown from '@/utils/formatMarkdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useEditArticle } from '@/hooks/useEditArticle'
import LoadingBackdrop from '../common/LoadingBackdrop'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import StyledButton from '../common/StyledButton'
import AuthModal from '../auth/AuthModal'

const Article = ({
  article,
  loading,
  invalidate,
}: {
  article: Article
  loading: boolean
  invalidate: () => void
}) => {
  const [selected, setSelected] = useState<Article>(article)
  const [editPrompt, setEditPrompt] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null)
  const [articleToGenerate, setArticleToGenerate] = useState<string | null>(
    null
  )
  const [user] = useAuthState(auth)
  const {
    error,
    success,
    loading: generating,
  } = useGenerateArticle({
    topic:
      selected._id === article._id
        ? article.title
        : `${article.title}: ${selected.title}`,
    subtopic: articleToGenerate,
    parentid: selected._id,
    enabled: !!articleToGenerate,
    userId: user?.uid,
    onSuccess: () => {
      invalidate()
    },
  })
  const { loading: editing } = useEditArticle({
    _id: articleToEdit?._id,
    editPrompt,
    onSuccess: () => {
      invalidate()
    },
    enabled: !!articleToEdit,
  })

  useEffect(() => {
    // when the article changes, set articleToGenerate to null to stop the loading animation
    setArticleToGenerate(null)
    setArticleToEdit(null)
    // find selected article in the article tree so the content will up to date
    const findSelected = (article: Article) => {
      if (article._id === selected._id) {
        setSelected(article)
      }
      if (article.childArticles.length > 0) {
        article.childArticles.forEach((subarticle) => {
          findSelected(subarticle)
        })
      }
    }
    findSelected(article)
  }, [article])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.container}>
      <AuthModal />
      <LoadingBackdrop loading={loading} />
      <nav className={styles.mobileNav}>
        <Logo />
        <Menu
          onClick={handleDrawerToggle}
          color='inherit'
          className={styles.menuIcon}
        />
      </nav>
      <Box sx={{ width: { sm: 300 }, flexShrink: { sm: 0 } }} component={'nav'}>
        <ResponsiveDrawer
          mobileOpen={mobileOpen || !!articleToGenerate}
          setMobileOpen={setMobileOpen}
        >
          <div className={styles.sidebar}>
            <Logo />
            <ArticleList
              article={article}
              setSelected={setSelected}
              setArticleToGenerate={setArticleToGenerate}
              selected={selected}
              isGenerating={!!articleToGenerate}
              articleToEdit={articleToEdit}
            />
            <p className='text-center text-gray-400 text-xs mt-4 w-4/5 mx-auto'>
              {/* info icon */}
              <Info className='inline-block mr-1' />
              Click a lamp or + icon to generate a sub-article
            </p>
          </div>
        </ResponsiveDrawer>
      </Box>
      <Box component={'article'}>
        <div className={styles.content}>
          <div className={styles.root} id='article'>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomOneDark as any}
                      language={match[1]}
                      PreTag='div'
                      className='p-15 w-full rounded-sm'
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                h2({ node, className, children, ...props }) {
                  return (
                    <span className='flex flex-row items-start gap-3 w-full mt-4'>
                      <h2 className={className} {...props}>
                        {children}
                      </h2>
                      <button
                        className={styles.lampSVG}
                        title='Generate sub-article'
                        onClick={(e) => {
                          const text =
                            e.currentTarget.parentElement.children[0]
                              .textContent
                          setArticleToGenerate(text)
                        }}
                      >
                        <LampSVG />
                      </button>
                    </span>
                  )
                },
              }}
              className='grid grid-cols-1 gap-4 w-full'
            >
              {formatMarkdown(selected.content)}
            </ReactMarkdown>
            {isEditing ? (
              <TextField
                variant='filled'
                label='Edit prompt'
                sx={{
                  width: '100%',
                  mt: 4,
                  display: isEditing ? 'grid' : 'none',
                  bgcolor: 'grey.800',
                }}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                // add check to end of input
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
                        sx={{ color: 'grey.500', cursor: 'pointer' }}
                      />
                      <Check
                        sx={{ color: 'white', cursor: 'pointer' }}
                        onClick={() => {
                          setIsEditing(false)
                          setArticleToEdit(selected)
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <div className={styles.edit}>
                <StyledButton
                  onClick={() => setIsEditing(true)}
                  text='Edit With GPT'
                  theme='light'
                  variant='contained'
                />
              </div>
            )}
          </div>
        </div>
      </Box>
    </div>
  )
}

export default Article