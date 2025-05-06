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
    let classNames =
      'px-4 py-2 rounded mt-2 hover-lift transition-all duration-300'
    let hoverClassNames = ''
    if (className) {
      classNames += ` ${className}`
    }
    if (theme === 'light') {
      classNames += ' bg-gray-200 text-gray-800'
      hoverClassNames = 'hover:bg-gray-300'
    }
    if (theme === 'dark') {
      classNames += ' bg-gray-800 text-white'
      hoverClassNames = 'hover:bg-gray-700'
    }
    if (theme === 'gradient') {
      classNames += ' bg-gradient-to-r from-amber-500 to-red-500 text-white'
      hoverClassNames = 'hover:from-amber-600 hover:to-red-600'
    }
    if (theme === 'blue-gradient') {
      classNames += ' bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
      hoverClassNames = 'hover:from-blue-600 hover:to-indigo-700'
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
      sx={{
        textTransform: 'none',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...sx,
      }}
      startIcon={startIcon}
      title={title}
    >
      {text}
    </Button>
  )
}

export default StyledButton
