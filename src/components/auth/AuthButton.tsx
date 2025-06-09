import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import Image from 'next/image'

interface AuthButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement> | null) => void
  fixed?: boolean
  compact?: boolean
}

/**
 * AuthButton component that displays different states based on authentication status
 * @param onClick - Handler for button click events
 * @param fixed - Whether the button should be fixed in position
 * @param compact - Whether to display a compact version of the button
 */
const AuthButton = ({
  onClick,
  fixed = true,
  compact = false,
}: AuthButtonProps) => {
  const [user, loading] = useAuthState(auth)
  const [isHovered, setIsHovered] = useState(false)

  const renderLoadingState = () => (
    <div
      className={`flex items-center ${
        compact ? 'justify-center' : 'space-x-3'
      }`}
    >
      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
      {!compact && (
        <span className='font-semibold tracking-wide'>Loading...</span>
      )}
    </div>
  )

  const renderUserAvatar = (size: 'sm' | 'md') => {
    const dimensions = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
    const indicatorSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

    return (
      <div className='relative'>
        <div
          className={`${dimensions} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden`}
        >
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt='Avatar'
              width={24}
              height={24}
              className='w-full h-full object-cover'
            />
          ) : (
            user?.email?.charAt(0).toUpperCase()
          )}
        </div>
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${indicatorSize} bg-green-400 ${
            size === 'sm' ? 'border' : 'border-2'
          } border-black/20 rounded-full`}
        />
      </div>
    )
  }

  const renderUserContent = () => {
    if (compact) {
      return (
        <div className='flex items-center justify-center'>
          {renderUserAvatar('sm')}
          <span className='text-xs font-medium text-white/90 ml-2'>
            {user?.displayName || user?.email?.split('@')[0]}
          </span>
        </div>
      )
    }

    return (
      <div className='flex items-center space-x-3'>
        {renderUserAvatar('md')}
        <div className='flex flex-col items-start'>
          <span className='font-bold text-sm tracking-wide'>My Account</span>
          <span className='text-xs text-white/70 font-medium'>
            {user?.email?.split('@')[0]}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isHovered ? 'rotate-180' : ''
          }`}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
            clipRule='evenodd'
          />
        </svg>
      </div>
    )
  }

  const renderSignInContent = () => {
    const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4'
    const containerSize = compact ? 'w-6 h-6' : 'w-8 h-8'

    return (
      <div className='flex items-center space-x-3'>
        <div className='relative'>
          <div
            className={`${containerSize} rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center`}
          >
            <svg className={iconSize} fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='absolute inset-0 rounded-full bg-blue-400/20 animate-ping' />
        </div>

        {!compact && (
          <div className='flex flex-col items-start'>
            <span className='font-bold text-sm tracking-wide'>Sign In</span>
            <span className='text-xs text-white/70 font-medium'>
              Get started free
            </span>
          </div>
        )}

        {compact ? (
          <span className='text-xs font-medium text-white/90 ml-2'>
            Sign In
          </span>
        ) : (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </div>
    )
  }

  const getButtonContent = () => {
    if (loading) return renderLoadingState()
    if (user) return renderUserContent()
    return renderSignInContent()
  }

  const buttonClasses = fixed ? 'fixed top-0 right-0 m-6 z-[100]' : ''
  const compactClasses = compact ? 'p-2 min-w-0 w-full h-10' : 'px-6 py-3'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        ${buttonClasses}
        ${compactClasses}
        relative group 
        bg-black/40 hover:bg-black/60 
        backdrop-blur-xl 
        border border-white/10 hover:border-white/20
        rounded-xl 
        text-white
        transition-all duration-300 
        transform hover:scale-105 hover:-translate-y-0.5
        shadow-lg hover:shadow-2xl hover:shadow-purple-500/10
        focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-black/20
      `}
      aria-label={user ? 'Account menu' : 'Sign in'}
      id='auth-button'
      title={
        compact
          ? user
            ? `${user.email?.split('@')[0]} - Account menu`
            : 'Sign in'
          : undefined
      }
    >
      <div className='absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/10 group-hover:via-purple-600/10 group-hover:to-pink-600/10 rounded-xl transition-all duration-300' />
      <div className='relative z-10'>{getButtonContent()}</div>
      <div className='absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12' />
    </button>
  )
}

export default AuthButton
