import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useGenerateArticle } from '@/lib/useGenerateArticle'
import Logo from '../Logo'
import {
  Backdrop,
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
} from '@mui/material'
import { ExpandLess, ExpandMore, Menu } from '@mui/icons-material'
import Article from '@/types/Article'
import ArticleList from '../ArticleList/ArticleList'
import ResponsiveDrawer from '../ResponsiveDrawer'

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
  const [articleToGenerate, setArticleToGenerate] = useState<string | null>(
    null
  )
  const {
    error,
    success,
    loading: generating,
  } = useGenerateArticle({
    topic: `${article.title}: ${selected.title}`,
    subtopic: articleToGenerate,
    parentid: selected._id,
    enabled: !!articleToGenerate,
    onSuccess: () => {
      invalidate()
    },
  })

  useEffect(() => {
    // when the article changes, set articleToGenerate to null to stop the loading animation
    setArticleToGenerate(null)
  }, [article])

  //   find all h2s within the content and add a button to copy the html of the h2
  useEffect(() => {
    const h2s =
      typeof window !== 'undefined' ? document.querySelectorAll('h2') : null
    if (!selected) return
    if (h2s.length < 1) return

    h2s.forEach((h2) => {
      const hasButton = h2.querySelector('button')
      if (hasButton) {
        return
      }
      const id = Math.random().toString(36).substring(7)
      const button = document.createElement('button')
      button.id = id
      button.classList.add(styles.lampSVG)
      button.addEventListener('click', () => {
        const subArticlePrompt = h2.textContent
        setArticleToGenerate(subArticlePrompt)
      })
      h2.appendChild(button)
      if (!document.getElementById(id)) return
      ReactDOM.render(<LampSVG />, document.getElementById(id))
    })
  }, [selected])

  const renderChildren = (children: Article[]) => {
    if (!children) {
      return null
    }
    const open = selected.childArticles?.some(
      (childArticle) => childArticle._id === selected._id
    )
    return (
      <Collapse
        timeout='auto'
        unmountOnExit
        in={open}
        className={styles.subList}
      >
        <List>
          {children?.map((childArticle, index) => (
            <React.Fragment key={index}>
              <ListItemButton
                className={
                  childArticle._id === selected._id ? styles.active : ''
                }
                onClick={(e) => {
                  e.stopPropagation()
                  setSelected(childArticle)
                }}
              >
                <ListItemText primary={childArticle.title} />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              {childArticle.childArticles &&
                renderChildren(childArticle.childArticles)}
              <Skeleton
                animation='wave'
                sx={{
                  bgcolor: 'grey.800',
                  height: 40,
                  marginLeft: '1rem',
                  display:
                    articleToGenerate && childArticle._id === selected._id
                      ? 'block'
                      : 'none',
                }}
              />
            </React.Fragment>
          ))}
        </List>
      </Collapse>
    )
  }

  const formatMarkdown = (content: string) => {
    // trim every line
    // this is because if there is whitespace at the beginning of a line,
    // it will not render the markdown properly
    const lines = content.split('\n')
    const trimmedLines = lines.map((line) => line.trim())
    return trimmedLines.join('\n')
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.container}>
      <Backdrop
        open={loading}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
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
            <p className='text-center text-gray-400 text-xs mb-4'>
              Click the lamp to generate a sub-article
            </p>
            <ArticleList
              article={article}
              setSelected={setSelected}
              selected={selected}
              isGenerating={!!articleToGenerate}
            />
          </div>
        </ResponsiveDrawer>
      </Box>
      <Box component={'article'}>
        <div className={styles.content}>
          <div className={styles.root} id='article'>
            <ReactMarkdown>{formatMarkdown(selected.content)}</ReactMarkdown>
          </div>
        </div>
      </Box>
    </div>
  )
}

export default Article
