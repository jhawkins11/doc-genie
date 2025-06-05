import React, { useState } from 'react'
import { Close } from '@mui/icons-material'

interface GuestPromptBannerProps {
  message: string
  ctaText: string
  onCtaClick: () => void
  variant?: 'info' | 'warning' | 'incentive'
  dismissible?: boolean
  onDismiss?: () => void
  isDarkMode?: boolean
}

const GuestPromptBanner: React.FC<GuestPromptBannerProps> = ({
  message,
  ctaText,
  onCtaClick,
  variant = 'info',
  dismissible = true,
  onDismiss,
  isDarkMode = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const handleCtaClick = () => {
    onCtaClick()
  }

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  if (isDismissed) {
    return null
  }

  const getVariantStyles = () => {
    const baseStyles = `
      backdrop-blur-xl border rounded-xl p-4 mb-6 transition-all duration-300 
      transform hover:scale-[1.02] shadow-lg hover:shadow-xl
    `

    switch (variant) {
      case 'info':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-purple-900/40 border-blue-400/20 hover:border-blue-400/30'
            : 'bg-gradient-to-r from-blue-50/80 via-blue-100/60 to-purple-50/80 border-blue-200/40 hover:border-blue-300/50'
        }`
      case 'warning':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-gradient-to-r from-amber-900/40 via-yellow-800/30 to-orange-900/40 border-amber-400/20 hover:border-amber-400/30'
            : 'bg-gradient-to-r from-amber-50/80 via-yellow-100/60 to-orange-50/80 border-amber-200/40 hover:border-amber-300/50'
        }`
      case 'incentive':
        return `${baseStyles} ${
          isDarkMode
            ? 'bg-gradient-to-r from-green-900/40 via-emerald-800/30 to-purple-900/40 border-green-400/20 hover:border-green-400/30'
            : 'bg-gradient-to-r from-green-50/80 via-emerald-100/60 to-purple-50/80 border-green-200/40 hover:border-green-300/50'
        }`
      default:
        return baseStyles
    }
  }

  const getCtaButtonStyles = () => {
    const baseButtonStyles = `
      px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 
      transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
    `

    switch (variant) {
      case 'info':
        return `${baseButtonStyles} ${
          isDarkMode
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white focus:ring-blue-400/50'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white focus:ring-blue-400/50'
        }`
      case 'warning':
        return `${baseButtonStyles} ${
          isDarkMode
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white focus:ring-amber-400/50'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white focus:ring-amber-400/50'
        }`
      case 'incentive':
        return `${baseButtonStyles} ${
          isDarkMode
            ? 'bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-500 hover:to-purple-500 text-white focus:ring-green-400/50'
            : 'bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 text-white focus:ring-green-400/50'
        }`
      default:
        return baseButtonStyles
    }
  }

  const getTextColor = () => {
    return isDarkMode ? 'text-gray-100' : 'text-gray-800'
  }

  const getDismissButtonStyles = () => {
    return `
      p-1 rounded-full transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400/50
      ${
        isDarkMode
          ? 'text-gray-300 hover:text-gray-100'
          : 'text-gray-500 hover:text-gray-700'
      }
    `
  }

  return (
    <div
      className={getVariantStyles()}
      role={variant === 'warning' ? 'alert' : 'status'}
      aria-live={variant === 'warning' ? 'assertive' : 'polite'}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1 mr-4'>
          <p className={`${getTextColor()} text-sm leading-relaxed`}>
            {message}
          </p>
        </div>

        <div className='flex items-center space-x-2'>
          <button
            onClick={handleCtaClick}
            onKeyDown={(e) => handleKeyDown(e, handleCtaClick)}
            className={getCtaButtonStyles()}
            aria-label={ctaText}
          >
            {ctaText}
          </button>

          {dismissible && (
            <button
              onClick={handleDismiss}
              onKeyDown={(e) => handleKeyDown(e, handleDismiss)}
              className={getDismissButtonStyles()}
              aria-label='Dismiss banner'
              title='Dismiss this message'
            >
              <Close className='w-4 h-4' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GuestPromptBanner
