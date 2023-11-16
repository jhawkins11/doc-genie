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
import {
  CircularProgress,
  InputAdornment,
  Skeleton,
  TextField,
} from '@mui/material'
import { Add, Check, Close, ViewAgenda, Visibility } from '@mui/icons-material'

export default function ArticleList({
  article,
  setSelected,
  selected,
  className,
  isGenerating,
  level = 1,
  setArticleToGenerate,
  articleToEdit,
  mode = 'edit',
}: {
  article: Article
  selected: Article
  setSelected: (article: Article) => void
  className?: string
  isGenerating?: boolean
  level?: number
  setArticleToGenerate: (subtopic: string | null) => void
  articleToEdit: Article | null
  mode?: 'edit' | 'view' | 'preview'
}) {
  const [open, setOpen] = React.useState<boolean>(true)
  const [customTopic, setCustomTopic] = React.useState<string>('')
  const [isAddingArticle, setIsAddingArticle] = React.useState<boolean>(false)

  const handleClick = (): void => {
    setSelected(article)
  }

  const handleDropdownClick = (e: React.MouseEvent, bool: boolean): void => {
    e.stopPropagation()
    setOpen(bool)
  }

  const handleAddArticle = (): void => {
    setSelected(article)
    setArticleToGenerate(customTopic)
    setIsAddingArticle(false)
    setCustomTopic('')
  }

  if (!article) {
    return null
  }

  return (
    <span className={cn(styles.root, className)}>
      <ListItemButton
        onClick={handleClick}
        className={cn(selected._id === article._id ? styles.active : '')}
        style={{ paddingLeft: `${level * 1}rem` }}
      >
        {mode === 'edit' && (
          <ListItemIcon
            sx={{ minWidth: 0, color: 'grey.500', width: 'auto', mr: 1 }}
            className={cn(styles.icon)}
          >
            <Add
              onClick={() => setIsAddingArticle(true)}
              className='m-auto'
              titleAccess='Add subtopic'
            />
          </ListItemIcon>
        )}
        <ListItemText
          primary={article.title}
          className={mode === 'preview' ? 'ml-2' : ''}
        />
        {articleToEdit?._id === article._id && (
          <CircularProgress size={20} className='mx-2' color='inherit' />
        )}
        {mode === 'edit' && (
          <>
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
          </>
        )}
      </ListItemButton>
      {mode !== 'preview' && (
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
              setArticleToGenerate={setArticleToGenerate}
              articleToEdit={articleToEdit}
            />
          ))}
        </Collapse>
      )}
      {isAddingArticle && (
        <TextField
          variant='filled'
          label='New subtopic'
          sx={{
            width: '100%',
            margin: '0 auto',
            bgcolor: 'grey.800',
          }}
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          // add check to end of input
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddArticle()
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Close
                  onClick={() => setIsAddingArticle(false)}
                  sx={{ color: 'grey.500', cursor: 'pointer' }}
                />
                <Check
                  sx={{ color: 'white', cursor: 'pointer' }}
                  onClick={() => {
                    handleAddArticle()
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      )}
      {isGenerating && (
        <Skeleton
          animation='wave'
          className={styles.topic}
          sx={{
            bgcolor: 'grey.800',
            height: 50,
            width: '90%',
            margin: '0 auto',
            display:
              isGenerating && selected._id === article._id ? 'grid' : 'none',
          }}
        />
      )}
    </span>
  )
}
