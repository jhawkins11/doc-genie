import { Button } from '@mui/material'
import { ReactNode } from 'react'

const StyledButton = ({
  onClick,
  text,
  className,
  variant,
  sx,
  theme,
  startIcon,
  title,
}: {
  onClick: () => void
  text: string
  className?: string
  variant?: 'contained' | 'outlined'
  theme?: 'light' | 'dark' | 'gradient' | 'blue-gradient'
  sx?: object
  startIcon?: ReactNode
  title?: string
}) => {
  const getClassNames = () => {
    let classNames = 'px-4 py-2 rounded mt-2'
    let hoverClassNames = ''
    if (className) {
      classNames += ` ${className}`
    }
    if (theme === 'light') {
      classNames += ' bg-white text-black dark:bg-gray-200 dark:text-gray-800'
      hoverClassNames =
        'hover:bg-white hover:bg-opacity-80 dark:hover:bg-gray-300'
    }
    if (theme === 'dark') {
      classNames += ' bg-black text-white dark:bg-gray-800'
      hoverClassNames =
        'hover:bg-black hover:bg-opacity-80 dark:hover:bg-gray-900'
    }
    if (theme === 'gradient') {
      classNames += ' gradient-button'
      hoverClassNames = '='
    }
    if (theme === 'blue-gradient') {
      classNames += ' bg-gradient-to-r from-blue-400 to-blue-500 text-white'
      hoverClassNames = 'hover:from-blue-500 hover:to-blue-600'
    }
    return `${classNames} ${hoverClassNames}`
  }

  return (
    <Button
      aria-label={text}
      variant={variant}
      onClick={onClick}
      // make sure tw classes override mui classes
      className={getClassNames()}
      sx={sx}
      startIcon={startIcon}
      title={title}
    >
      {text}
    </Button>
  )
}

export default StyledButton
