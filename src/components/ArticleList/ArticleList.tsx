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
import { useDarkMode } from '@/contexts/DarkModeContext'

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
  const { isDarkMode } = useDarkMode()

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

  return (
    <span className={cn(styles.root, className, styles.animate)}>
      <ListItemButton
        onClick={handleClick}
        className={cn(
          styles.listItemButton,
          selected._id === article._id
            ? `${styles.active} text-accent-gold`
            : ''
        )}
        style={{ paddingLeft: `${level * 1}rem` }}
      >
        {mode === 'edit' && (
          <ListItemIcon
            sx={{
              minWidth: 0,
              color: isDarkMode ? 'grey.500' : 'grey.700',
              width: 'auto',
              mr: 1,
            }}
            className={cn(styles.icon)}
          >
            <Add
              onClick={() => setIsAddingArticle(true)}
              className={`m-auto transition-all duration-300 hover:text-accent-gold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
              titleAccess='Add subtopic'
            />
          </ListItemIcon>
        )}
        <ListItemText
          primary={article.title}
          className={mode === 'preview' ? 'ml-2' : ''}
          primaryTypographyProps={{
            className: `transition-all duration-300 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`,
          }}
        />
        {articleToEdit?._id === article._id && (
          <CircularProgress size={20} className='mx-2' color='inherit' />
        )}

        {open && article.childArticles?.length ? (
          <ExpandLess
            onClick={(e: React.MouseEvent) => handleDropdownClick(e, false)}
            className={`${styles.icon} ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          />
        ) : article.childArticles?.length ? (
          <ExpandMore
            onClick={(e: React.MouseEvent) => handleDropdownClick(e, true)}
            className={`${styles.icon} ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          />
        ) : null}
      </ListItemButton>
      {mode !== 'preview' && (
        <Collapse in={open} timeout='auto' appear={true}>
          {article.childArticles?.map((childArticle, index) => (
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
              mode={mode}
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
            bgcolor: isDarkMode ? 'grey.800' : 'grey.200',
          }}
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleAddArticle()
            }
          }}
          className={`transition-all duration-300 ${styles.fadeIn} ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
          InputLabelProps={{
            className: isDarkMode ? 'text-gray-300' : 'text-gray-700',
          }}
          InputProps={{
            className: isDarkMode ? 'text-gray-200' : 'text-gray-700',
            endAdornment: (
              <InputAdornment position='end'>
                <Close
                  onClick={() => setIsAddingArticle(false)}
                  sx={{
                    color: isDarkMode ? 'grey.500' : 'grey.700',
                    cursor: 'pointer',
                  }}
                  className={`transition-all duration-300 hover:text-red-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                />
                <Check
                  sx={{
                    color: isDarkMode ? 'white' : 'grey.800',
                    cursor: 'pointer',
                  }}
                  className={`transition-all duration-300 hover:text-green-500 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}
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
            bgcolor: isDarkMode ? 'grey.800' : 'grey.300',
            height: 50,
            width: '90%',
            margin: '0 auto',
            display:
              isGenerating && selected._id === article._id ? 'grid' : 'none',
            borderRadius: '4px',
          }}
        />
      )}
    </span>
  )
}
