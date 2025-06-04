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
      'px-6 py-3 rounded-xl mt-2 hover-lift transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 font-semibold relative overflow-hidden group'
    let hoverClassNames = ''
    let backgroundClasses = ''
    let shadowClasses = 'shadow-lg hover:shadow-xl'

    if (className) {
      classNames += ` ${className}`
    }

    if (theme === 'light') {
      backgroundClasses =
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
      hoverClassNames =
        'hover:from-gray-200 hover:to-gray-300 hover:border-gray-400'
      shadowClasses += ' hover:shadow-gray-300/50'
    }

    if (theme === 'dark') {
      backgroundClasses =
        'bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700'
      hoverClassNames =
        'hover:from-gray-700 hover:to-gray-800 hover:border-gray-600'
      shadowClasses += ' hover:shadow-gray-900/50'
    }

    if (theme === 'gradient') {
      backgroundClasses =
        'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 text-white border border-slate-500/30'
      hoverClassNames =
        'hover:from-amber-600 hover:via-orange-600 hover:to-red-600 hover:border-orange-400/40'
      shadowClasses += ' hover:shadow-orange-500/20'
    }

    if (theme === 'blue-gradient') {
      backgroundClasses =
        'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white border border-blue-400/30'
      hoverClassNames =
        'hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 hover:border-blue-300/50'
      shadowClasses += ' hover:shadow-blue-500/30'
    }

    return `${classNames} ${backgroundClasses} ${hoverClassNames} ${shadowClasses}`
  }

  return (
    <div className='relative group'>
      {/* Subtle glow effect */}
      <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500' />

      <Button
        aria-label={text}
        variant={variant}
        onClick={onClick}
        className={getClassNames()}
        sx={{
          textTransform: 'none',
          fontWeight: '600',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: 'inherit',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          },
          '&:hover::before': {
            opacity: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transition: 'left 0.6s ease',
            pointerEvents: 'none',
          },
          '&:hover::after': {
            left: '100%',
          },
          ...sx,
        }}
        startIcon={startIcon}
        title={title}
      >
        <span className='relative z-10'>{text}</span>
      </Button>
    </div>
  )
}

export default StyledButton
