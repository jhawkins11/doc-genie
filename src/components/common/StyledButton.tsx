import { Button } from '@mui/material'

const StyledButton = ({
  onClick,
  text,
  className,
  variant,
  sx,
  theme,
}: {
  onClick: () => void
  text: string
  className?: string
  variant?: 'contained' | 'outlined'
  theme?: 'light' | 'dark' | 'gradient' | 'blue-gradient'
  sx?: object
}) => {
  const getClassNames = () => {
    let classNames = 'px-4 py-2 rounded mt-2'
    let hoverClassNames = ''
    if (className) {
      classNames += ` ${className}`
    }
    if (theme === 'light') {
      classNames += ' bg-white text-black'
      hoverClassNames = 'hover:bg-white hover:bg-opacity-80'
    }
    if (theme === 'dark') {
      classNames += ' bg-black text-white'
      hoverClassNames = 'hover:bg-grey-800'
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
      className={getClassNames()}
      variant={variant}
      onClick={onClick}
      sx={sx}
    >
      {text}
    </Button>
  )
}

export default StyledButton
