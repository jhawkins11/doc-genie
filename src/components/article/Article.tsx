import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useRouter } from 'next/router'
import { Article, useGenerateArticle } from '@/lib/useGenerateArticle'
import Logo from '../Logo'
import cn from 'classnames'
import { Box, Drawer, Skeleton } from '@mui/material'
import { Menu } from '@mui/icons-material'

const Article = ({
  article,
  loading,
  invalidate,
}: {
  article: Article
  loading: boolean
  invalidate: () => void
}) => {
  // const [mdl, setMdl] = useState<string>(article.content)
  const [selected, setSelected] = useState<Article>(article)
  const [articleToGenerate, setArticleToGenerate] = useState<string | null>(
    null
  )
  console.log('selected', selected)
  const topic = article.title
  const {
    error,
    success,
    loading: generating,
  } = useGenerateArticle({
    topic: selected.title,
    subtopic: articleToGenerate,
    parentid: selected.id,
    enabled: !!articleToGenerate,
    onSuccess: () => {
      invalidate()
      setArticleToGenerate(null)
    },
  })

  //   find all h2s within the content and add a button to copy the html of the h2 and its sibling p tags
  useEffect(() => {
    const h2s =
      typeof window !== 'undefined' ? document.querySelectorAll('h2') : []
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
    return (
      <ul className={styles.subList}>
        {children?.map((childArticle, index) => (
          <React.Fragment key={index}>
            <li
              className={childArticle.id === selected.id ? styles.active : ''}
              onClick={(e) => {
                e.stopPropagation()
                setSelected(childArticle)
              }}
            >
              {childArticle.title}
            </li>
            {childArticle.childArticles &&
              renderChildren(childArticle.childArticles)}
            <Skeleton
              animation='wave'
              sx={{
                bgcolor: 'grey.800',
                height: 40,
                marginLeft: '1rem',
                display:
                  generating && childArticle.id === selected.id
                    ? 'block'
                    : 'none',
              }}
            />
          </React.Fragment>
        ))}
      </ul>
    )
  }

  const [mobileOpen, setMobileOpen] = React.useState(true)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }
  const container =
    window !== undefined ? () => window.document.body : undefined
  const drawerWidth = 300
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 900
  const ResponsiveDrawer = ({ children }: { children: React.ReactNode }) => {
    if (isSmallScreen) {
      return (
        <Drawer
          container={container}
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {children}
        </Drawer>
      )
    }
    return (
      <Drawer
        variant='permanent'
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
        open
      >
        {children}
      </Drawer>
    )
  }

  const formatMarkdown = (content: string) => {
    // trim every line
    const lines = content.split('\n')
    const trimmedLines = lines.map((line) => line.trim())
    return trimmedLines.join('\n')
  }

  if (!article) {
    return null
  }
  return (
    <div className={styles.container}>
      <nav className={styles.mobileNav}>
        <Logo />
        <Menu
          onClick={handleDrawerToggle}
          color='inherit'
          className={styles.menuIcon}
        />
      </nav>
      <Box
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        component={'nav'}
      >
        <ResponsiveDrawer>
          <div className={styles.sidebar}>
            <Logo />
            <ul className={styles.mainList}>
              <li
                className={cn(
                  styles.topic,
                  selected.id === article.id ? styles.active : ''
                )}
                onClick={() => {
                  setSelected(article)
                }}
              >
                {' '}
                {topic}
              </li>
              {article && renderChildren(article.childArticles || [])}
              <Skeleton
                animation='wave'
                className={styles.topic}
                sx={{
                  bgcolor: 'grey.800',
                  height: 40,
                  width: '70%',
                  marginLeft: '1rem',
                  display:
                    generating && selected.id === article.id ? 'block' : 'none',
                }}
              />
            </ul>
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
