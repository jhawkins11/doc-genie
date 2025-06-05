import React, { useEffect, useRef } from 'react'
import { Close } from '@mui/icons-material'

interface ActionGuidanceModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  primaryAction?: {
    text: string
    onClick: () => void
  }
  secondaryAction?: {
    text: string
    onClick: () => void
  }
  isDarkMode?: boolean
}

const ActionGuidanceModal: React.FC<ActionGuidanceModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  primaryAction,
  secondaryAction,
  isDarkMode = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus the first focusable element when modal opens
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      // Handle escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)

      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen, onClose])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleActionClick = (action: () => void) => {
    action()
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const getModalStyles = () => {
    return `
      ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 border-slate-600/30'
          : 'bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 border-gray-200/30'
      }
      backdrop-blur-xl border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6
      transform transition-all duration-300 scale-100 opacity-100
    `
  }

  const getTitleStyles = () => {
    return `text-xl font-bold mb-4 ${
      isDarkMode ? 'text-gray-100' : 'text-gray-900'
    }`
  }

  const getMessageStyles = () => {
    return `text-sm leading-relaxed mb-6 ${
      isDarkMode ? 'text-gray-300' : 'text-gray-600'
    }`
  }

  const getPrimaryButtonStyles = () => {
    return `
      px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 
      transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
      bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
      text-white focus:ring-blue-400/50
    `
  }

  const getSecondaryButtonStyles = () => {
    return `
      px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 
      transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
      ${
        isDarkMode
          ? 'bg-slate-700 hover:bg-slate-600 text-gray-200 focus:ring-slate-400/50'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400/50'
      }
    `
  }

  const getCloseButtonStyles = () => {
    return `
      absolute top-4 right-4 p-1 rounded-full transition-all duration-200 
      hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 
      focus:ring-offset-2 focus:ring-gray-400/50
      ${
        isDarkMode
          ? 'text-gray-400 hover:text-gray-200'
          : 'text-gray-500 hover:text-gray-700'
      }
    `
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
      onClick={handleOverlayClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      aria-describedby='modal-description'
    >
      <div
        ref={modalRef}
        className={getModalStyles()}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          className={getCloseButtonStyles()}
          aria-label='Close modal'
          title='Close modal'
        >
          <Close className='w-5 h-5' />
        </button>

        <h2 id='modal-title' className={getTitleStyles()}>
          {title}
        </h2>

        <p id='modal-description' className={getMessageStyles()}>
          {message}
        </p>

        <div className='flex space-x-3 justify-end'>
          {secondaryAction && (
            <button
              onClick={() => handleActionClick(secondaryAction.onClick)}
              className={getSecondaryButtonStyles()}
            >
              {secondaryAction.text}
            </button>
          )}

          {primaryAction && (
            <button
              ref={lastFocusableRef}
              onClick={() => handleActionClick(primaryAction.onClick)}
              className={getPrimaryButtonStyles()}
            >
              {primaryAction.text}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActionGuidanceModal
