import * as React from 'react'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
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
  Tooltip,
  ClickAwayListener,
} from '@mui/material'
import { Add, Check, Close } from '@mui/icons-material'
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
  const [showInput, setShowInput] = React.useState<boolean>(false)
  const [animationClass, setAnimationClass] = React.useState<string>('')
  const { isDarkMode } = useDarkMode()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [hasAnimatedChildren, setHasAnimatedChildren] = React.useState(false)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isAddingArticle) {
      setShowInput(true)
      setAnimationClass(styles.inputAppear)
      if (inputRef.current) {
        timeoutId = setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
      }
    } else if (showInput) {
      setAnimationClass(styles.inputDisappear)
      timeoutId = setTimeout(() => {
        setShowInput(false)
        setCustomTopic('')
      }, 350)
    }
    return () => clearTimeout(timeoutId)
  }, [isAddingArticle, showInput])

  React.useEffect(() => {
    if (open && !hasAnimatedChildren) {
      setHasAnimatedChildren(true)
    }
  }, [open, hasAnimatedChildren])

  const handleClick = (): void => {
    setSelected(article)
  }

  const handleDropdownClick = (e: React.MouseEvent, bool: boolean): void => {
    e.stopPropagation()
    setOpen(bool)
  }

  const handleAddArticle = (): void => {
    if (customTopic.trim()) {
      setSelected(article)
      setArticleToGenerate(customTopic)
      setIsAddingArticle(false)
    }
  }

  const handleAddLineClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    if (!isAddingArticle && !showInput) {
      setIsAddingArticle(true)
    }
    if (!open && article.childArticles?.length) {
      setOpen(true)
    }
  }

  const handleClickAway = (): void => {
    if (isAddingArticle && !customTopic.trim()) {
      setIsAddingArticle(false)
    }
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
        <ListItemText
          primary={article.title}
          className={mode === 'preview' ? 'ml-2' : ''}
          primaryTypographyProps={{
            className: 'transition-all duration-300 text-white font-medium',
          }}
        />
        {articleToEdit?._id === article._id && (
          <CircularProgress size={20} className='mx-2' color='inherit' />
        )}

        {open && article.childArticles?.length ? (
          <ExpandLess
            onClick={(e: React.MouseEvent) => handleDropdownClick(e, false)}
            className={`${styles.icon} text-white`}
          />
        ) : article.childArticles?.length ? (
          <ExpandMore
            onClick={(e: React.MouseEvent) => handleDropdownClick(e, true)}
            className={`${styles.icon} text-white`}
          />
        ) : null}

        {mode === 'edit' && (
          <div className={styles.addLineContainer} onClick={handleAddLineClick}>
            <div className={styles.addLine}>
              <Tooltip title='Add subtopic' arrow placement='top'>
                <div className={styles.addButton}>
                  <Add
                    fontSize='small'
                    style={{ fontSize: '14px', color: '#fff' }}
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        )}
      </ListItemButton>

      <ClickAwayListener
        onClickAway={handleClickAway}
        mouseEvent='onMouseDown'
        touchEvent='onTouchStart'
      >
        <div style={{ position: 'relative' }}>
          {showInput && (
            <div className={cn(styles.subtopicInputContainer, animationClass)}>
              <TextField
                variant='filled'
                label='New subtopic'
                placeholder='Enter topic name...'
                fullWidth
                size='small'
                inputRef={inputRef}
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    handleAddArticle()
                  } else if (e.key === 'Escape') {
                    setIsAddingArticle(false)
                  }
                }}
                className={styles.subtopicInput}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Tooltip title='Cancel' arrow placement='top'>
                        <Close
                          onClick={() => {
                            setIsAddingArticle(false)
                          }}
                          className={`${styles.subtopicInputIcon} ${styles.cancelIcon}`}
                          sx={{
                            color: isDarkMode ? 'grey.400' : 'grey.600',
                            cursor: 'pointer',
                          }}
                        />
                      </Tooltip>
                      <Tooltip title='Add subtopic' arrow placement='top'>
                        <span>
                          <Check
                            onClick={handleAddArticle}
                            className={`${styles.subtopicInputIcon} ${styles.confirmIcon}`}
                            sx={{
                              color: isDarkMode ? 'grey.300' : 'grey.700',
                              cursor: customTopic.trim()
                                ? 'pointer'
                                : 'default',
                              opacity: customTopic.trim() ? 1 : 0.4,
                              pointerEvents: customTopic.trim()
                                ? 'auto'
                                : 'none',
                            }}
                          />
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          )}
        </div>
      </ClickAwayListener>

      {mode !== 'preview' && (
        <Collapse
          in={open}
          timeout='auto'
          appear={true}
          mountOnEnter
          unmountOnExit
        >
          {article.childArticles?.map((childArticle, index) => (
            <ArticleList
              selected={selected}
              setSelected={setSelected}
              article={childArticle}
              key={childArticle._id as unknown as string}
              className={cn(styles.child, {
                [styles.childAnimate]:
                  hasAnimatedChildren && open && level === 1,
              })}
              isGenerating={isGenerating}
              level={level + 1}
              setArticleToGenerate={setArticleToGenerate}
              articleToEdit={articleToEdit}
              mode={mode}
            />
          ))}
        </Collapse>
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
