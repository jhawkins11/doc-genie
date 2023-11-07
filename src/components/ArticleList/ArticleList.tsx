import * as React from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Article from '@/types/Article'
import styles from './ArticleList.module.css'
import cn from 'classnames'
import { Skeleton } from '@mui/material'

export default function ArticleList({
  article,
  setSelected,
  selected,
  className,
  isGenerating,
  level = 1,
}: {
  article: Article
  selected: Article
  setSelected: (article: Article) => void
  className?: string
  isGenerating?: boolean
  level?: number
}) {
  const [open, setOpen] = React.useState<boolean>(true)

  const handleClick = (): void => {
    setSelected(article)
  }

  const handleDropdownClick = (e: React.MouseEvent, bool: boolean): void => {
    e.stopPropagation()
    setOpen(bool)
  }

  if (!article) {
    return null
  }

  return (
    <List sx={{ width: '100%' }} className={cn(styles.root, className)}>
      <ListItemButton
        onClick={handleClick}
        className={cn(selected._id === article._id ? styles.active : '')}
        style={{ paddingLeft: `${level * 1}rem` }}
      >
        <ListItemText primary={article.title} />
        {open && article.childArticles?.length ? (
          <ExpandLess
            onClick={(e) => handleDropdownClick(e, false)}
            className={styles.icon}
          />
        ) : article.childArticles?.length ? (
          <ExpandMore
            onClick={(e) => handleDropdownClick(e, true)}
            className={styles.icon}
          />
        ) : null}
      </ListItemButton>
      <Collapse in={open} unmountOnExit>
        {article.childArticles?.map((childArticle) => (
          <ArticleList
            selected={selected}
            setSelected={setSelected}
            article={childArticle}
            key={childArticle._id as unknown as string}
            className={styles.child}
            isGenerating={isGenerating}
            level={level + 1}
          />
        ))}
      </Collapse>
      {isGenerating && (
        <ListItemButton>
          <Skeleton
            animation='wave'
            className={styles.topic}
            sx={{
              bgcolor: 'grey.800',
              height: 40,
              width: '70%',
              marginLeft: '1rem',
              display:
                isGenerating && selected._id === article._id ? 'block' : 'none',
            }}
          />
        </ListItemButton>
      )}
    </List>
  )
}
