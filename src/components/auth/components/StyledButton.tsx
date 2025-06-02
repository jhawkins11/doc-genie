import React from 'react'

interface StyledButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'google' | 'danger'
  disabled?: boolean
  className?: string
  loading?: boolean
}

const StyledButton: React.FC<StyledButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  loading = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'google':
        return 'bg-white text-gray-900 hover:bg-gray-100 border-white/20'
      case 'secondary':
        return 'bg-white/10 text-white hover:bg-white/20 border-white/20'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white border-red-400/20'
      default:
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-400 hover:via-pink-400 hover:to-blue-400 text-white border-purple-400/20'
    }
  }

  return (
    <div className='relative group'>
      <div className='absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300' />
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`relative w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border backdrop-blur-sm ${getVariantClasses()} ${className}`}
      >
        {loading ? (
          <div className='flex items-center justify-center space-x-2'>
            <svg
              className='animate-spin h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    </div>
  )
}

export default StyledButton
