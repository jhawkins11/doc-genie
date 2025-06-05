import React from 'react'
import { Close } from '@mui/icons-material'

interface RateLimitModalProps {
  isOpen: boolean
  onClose: () => void
  isGuest: boolean
  onSignUp?: () => void
  isDarkMode?: boolean
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({
  isOpen,
  onClose,
  isGuest,
  onSignUp,
  isDarkMode = false,
}) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSignUpClick = () => {
    onSignUp?.()
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isDarkMode ? 'bg-black/70' : 'bg-black/50'
      } backdrop-blur-sm`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role='dialog'
      aria-modal='true'
      aria-labelledby='rate-limit-title'
      aria-describedby='rate-limit-description'
    >
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl transform transition-all ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-slate-700'
            : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-slate-700 focus:ring-slate-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-400'
          }`}
          aria-label='Close modal'
        >
          <Close className='w-5 h-5' />
        </button>

        <div className='flex justify-center mb-4'>
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDarkMode
                ? 'bg-gradient-to-br from-amber-600 to-orange-600'
                : 'bg-gradient-to-br from-amber-500 to-orange-500'
            }`}
          >
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
        </div>

        <h2
          id='rate-limit-title'
          className={`text-xl font-bold text-center mb-3 ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Generation Limit Reached
        </h2>

        <div
          id='rate-limit-description'
          className={`text-center mb-6 space-y-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {isGuest ? (
            <>
              <p className='text-sm leading-relaxed'>
                You&apos;ve reached the daily limit of{' '}
                <strong>2 article generations</strong> for guest users.
              </p>
              <p className='text-sm leading-relaxed'>
                Sign up for a free account to get{' '}
                <strong>5 article generations per day</strong> and save your
                work permanently!
              </p>
            </>
          ) : (
            <>
              <p className='text-sm leading-relaxed'>
                You&apos;ve reached your daily limit of{' '}
                <strong>5 article generations</strong>.
              </p>
              <p className='text-sm leading-relaxed'>
                Your limit will reset in 24 hours. Thank you for using Doc
                Genie!
              </p>
            </>
          )}
        </div>

        <div className='flex flex-col space-y-3'>
          {isGuest ? (
            <>
              <button
                onClick={handleSignUpClick}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white focus:ring-blue-400/50'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white focus:ring-blue-400/50'
                }`}
              >
                Sign Up for Free
              </button>
              <button
                onClick={onClose}
                className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-200 focus:ring-slate-500'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400'
                }`}
              >
                Continue Browsing
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white focus:ring-blue-400/50'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white focus:ring-blue-400/50'
              }`}
            >
              Got it
            </button>
          )}
        </div>

        <div
          className={`mt-4 pt-4 border-t text-center ${
            isDarkMode
              ? 'border-slate-700 text-gray-400'
              : 'border-gray-200 text-gray-500'
          }`}
        >
          <p className='text-xs'>Limits reset daily at midnight UTC</p>
        </div>
      </div>
    </div>
  )
}

export default RateLimitModal
