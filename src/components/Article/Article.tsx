import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useGenerateArticle } from '@/hooks/useGenerateArticle'
import Logo from '../common/Logo'
import {
  Box,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  TextField,
  useMediaQuery,
} from '@mui/material'
import { Check, Close, CopyAll, Info, Menu } from '@mui/icons-material'
import Article from '@/types/Article'
import ArticleList from '../ArticleList/ArticleList'
import ResponsiveDrawer from '../common/ResponsiveDrawer/ResponsiveDrawer'
import formatMarkdown from '@/utils/formatMarkdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { useEditArticle } from '@/hooks/useEditArticle'
import LoadingBackdrop from '../common/LoadingBackdrop'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import StyledButton from '../common/StyledButton'
import AuthModal from '../auth/AuthModal'
import ArticleContent from '../common/ArticleContent/ArticleContent'

const Article = ({
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
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null)
  const [articleToGenerate, setArticleToGenerate] = useState<string | null>(
    null
  )
  const [user] = useAuthState(auth)
  const isSmallScreen = useMediaQuery('(max-width:900px)')
  useGenerateArticle({
    topic:
      selected?._id === articles?.[0]?._id
        ? articles?.[0]?.title
        : `${articles?.[0]?.title}: ${selected?.title}`,
    subtopic: articleToGenerate,
    parentid: selected?._id,
    enabled: !!articleToGenerate,
    userId: user?.uid,
    onSuccess: () => {
      invalidate()
    },
  })
  useEditArticle({
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
    <div className={styles.container}>
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
          <Logo />
          {articles.length > 1 && selected && (
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
                  mode={articles.length > 1 ? 'preview' : 'edit'}
                />
              ))}
            </List>
          )}
          {articles?.length === 1 && (
            <p className='text-center text-gray-400 text-xs mt-4 w-4/5 mx-auto'>
              {/* info icon */}
              <Info className='inline-block mr-1' />
              Click a lamp or + icon to generate a sub-article
            </p>
          )}
          <AuthModal fixedButton={!isSmallScreen} />
        </ResponsiveDrawer>
      </Box>
      <Box component={'article'} sx={{ minHeight: '100vh' }}>
        <div className={styles.content}>
          <div className={styles.root} id='article'>
            <ArticleContent
              selected={selected}
              setArticleToGenerate={setArticleToGenerate}
              viewOnly={articles.length > 1}
              showLink={articles.length > 1}
            />
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
            ) : selected ? (
              <div className={styles.edit}>
                <StyledButton
                  onClick={() => setIsEditing(true)}
                  text='Edit With GPT'
                  theme='light'
                  variant='contained'
                />
              </div>
            ) : null}
          </div>
        </div>
      </Box>
    </div>
  )
}

export default Article
