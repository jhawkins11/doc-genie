import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react'
import { Divider } from '@mui/material'
import {
  loginWithGoogle,
  loginWithEmail,
  signupWithEmail,
  resetPassword,
  logout,
} from '@/utils/firebaseUtils'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import AuthButton from './AuthButton'
import tryCatch from '@/utils/tryCatch'
import LoadingBackdrop from '../common/LoadingBackdrop'
import StyledButton from '../common/StyledButton'
import ErrorMessage from '../ErrorMessage'
import Modal from '../common/Modal'
import FormInput from '../common/FormInput'
import { useRouter } from 'next/router'

function AuthModal({
  fixedButton = true,
  isDarkMode = false,
  compact = false,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [view, setView] = useState<'login' | 'signup' | 'forgotPassword'>(null)
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const determineDropdownPosition = (
    buttonRect: DOMRect,
    dropdownElement: HTMLDivElement,
    isCompact: boolean,
    isFixedButton: boolean
  ) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const PADDING = 8
    const MIN_VIEWPORT_PADDING = 16

    const ddHeight = dropdownElement.offsetHeight
    const ddWidth = dropdownElement.offsetWidth

    let topPos: number
    let leftPos: number

    if (!isFixedButton && isCompact) {
      topPos = buttonRect.top - ddHeight - PADDING
      leftPos = buttonRect.left + buttonRect.width / 2 - ddWidth / 2
      if (topPos < MIN_VIEWPORT_PADDING) {
        const belowTopPos = buttonRect.bottom + PADDING
        if (belowTopPos + ddHeight <= viewportHeight - MIN_VIEWPORT_PADDING) {
          topPos = belowTopPos
        } else {
          topPos = MIN_VIEWPORT_PADDING
        }
      }
    } else {
      topPos = buttonRect.bottom + PADDING
      if (topPos + ddHeight > viewportHeight - MIN_VIEWPORT_PADDING) {
        const upwardAttempt = buttonRect.top - ddHeight - PADDING
        if (upwardAttempt > MIN_VIEWPORT_PADDING) {
          topPos = upwardAttempt
        } else {
          topPos = Math.max(
            MIN_VIEWPORT_PADDING,
            viewportHeight - ddHeight - MIN_VIEWPORT_PADDING
          )
        }
      }
      leftPos = buttonRect.right - ddWidth
      if (isFixedButton) {
        leftPos = Math.min(
          leftPos,
          viewportWidth - ddWidth - MIN_VIEWPORT_PADDING
        )
      }
    }

    if (leftPos + ddWidth > viewportWidth - MIN_VIEWPORT_PADDING) {
      leftPos = viewportWidth - ddWidth - MIN_VIEWPORT_PADDING
    }
    if (leftPos < MIN_VIEWPORT_PADDING) {
      leftPos = MIN_VIEWPORT_PADDING
    }
    return { top: topPos, left: leftPos }
  }

  useLayoutEffect(() => {
    if (anchorEl && dropdownRef.current) {
      const buttonRect = anchorEl.getBoundingClientRect()
      const position = determineDropdownPosition(
        buttonRect,
        dropdownRef.current,
        compact,
        fixedButton
      )
      setDropdownPosition(position)
    }
  }, [anchorEl, compact, fixedButton])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        anchorEl &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        const authButton = document.getElementById('auth-button')
        if (authButton && !authButton.contains(event.target as Node)) {
          setAnchorEl(null)
        }
      }
    }

    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [anchorEl])

  useEffect(() => {
    const handleResize = () => {
      if (anchorEl) {
        setAnchorEl(null)
      }
    }

    if (anchorEl) {
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [anchorEl])

  const clear = () => {
    setEmail('')
    setPassword('')
    setError(null)
  }
  const handleAuthAction = useCallback(
    async (action: () => Promise<any>) => {
      await tryCatch(async () => {
        await action()
        clear()
        setView(null)
      }, setError)
    },
    [setError]
  )

  const handleLoginWithEmail = useCallback(async () => {
    await handleAuthAction(() => loginWithEmail(email, password))
  }, [handleAuthAction, email, password])

  const handleLogout = useCallback(async () => {
    await handleAuthAction(logout)
  }, [handleAuthAction])

  const handleSignupWithEmail = useCallback(async () => {
    await handleAuthAction(() => signupWithEmail(email, password))
  }, [handleAuthAction, email, password])

  const handleResetPassword = useCallback(async () => {
    await handleAuthAction(() => resetPassword(email))
  }, [handleAuthAction, email])

  const handleLoginWithGoogle = useCallback(async () => {
    await handleAuthAction(loginWithGoogle)
  }, [handleAuthAction])

  const [user, loading] = useAuthState(auth)

  const getView = () => {
    if (user && anchorEl) {
      return (
        <>
          <div
            className='fixed inset-0 z-[199] bg-black/5'
            onClick={() => setAnchorEl(null)}
          />

          <div
            ref={dropdownRef}
            className='fixed z-[200]'
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='absolute -inset-px bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-sm'></div>

            <div className='relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden min-w-[280px]'>
              <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent'></div>

              <div className='px-6 py-4 border-b border-white/5'>
                <div className='flex items-center space-x-3'>
                  <div className='relative'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden'>
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt='Avatar'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        user.email?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-black/20 rounded-full'></div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-white font-semibold text-sm truncate'>
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className='text-white/60 text-xs truncate'>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className='py-2'>
                <button
                  onClick={() => {
                    router.push('/docs')
                    setAnchorEl(null)
                  }}
                  className='w-full px-6 py-3 text-left text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center space-x-3 group'
                >
                  <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200'>
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z' />
                      <path d='M6 8h8v2H6V8zm0 3h8v1H6v-1z' />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='font-semibold text-sm'>My Documents</p>
                    <p className='text-xs text-white/50'>View all your docs</p>
                  </div>
                  <svg
                    className='w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-200'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>

                <div className='mx-6 my-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>

                <button
                  onClick={handleLogout}
                  className='w-full px-6 py-3 text-left text-red-300/80 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 flex items-center space-x-3 group'
                >
                  <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200'>
                    <svg
                      className='w-4 h-4'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='flex-1'>
                    <p className='font-semibold text-sm'>Sign Out</p>
                    <p className='text-xs text-white/40'>
                      Logout of your account
                    </p>
                  </div>
                </button>
              </div>

              <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>
            </div>
          </div>
        </>
      )
    }
    if (view === 'forgotPassword') {
      return (
        <Modal
          open={view === 'forgotPassword'}
          handleClose={() => setView(null)}
          title='Forgot Password'
          isDarkMode={isDarkMode}
        >
          <FormInput
            label='Email'
            type='email'
            value={email}
            setValue={setEmail}
            onEnter={handleResetPassword}
            isDarkMode={isDarkMode}
          />
          <div className='grid grid-cols-2 gap-2'>
            <StyledButton
              onClick={() => setView(null)}
              text='Cancel'
              theme='light'
            />
            <StyledButton
              onClick={handleResetPassword}
              text='Reset Password'
              theme='blue-gradient'
            />
          </div>
          <ErrorMessage error={error} />
        </Modal>
      )
    }

    if (view === 'signup') {
      return (
        <Modal
          open={view === 'signup'}
          handleClose={() => setView(null)}
          title='Sign Up'
          isDarkMode={isDarkMode}
        >
          <FormInput
            label='Email'
            type='email'
            value={email}
            setValue={setEmail}
            isDarkMode={isDarkMode}
          />
          <FormInput
            label='Password'
            type='password'
            value={password}
            setValue={setPassword}
            onEnter={handleSignupWithEmail}
            isDarkMode={isDarkMode}
          />

          <div className='grid grid-cols-2 gap-2'>
            <StyledButton
              onClick={() => setView(null)}
              text='Cancel'
              theme='light'
            />

            <StyledButton
              onClick={handleSignupWithEmail}
              text='Sign Up'
              theme='blue-gradient'
            />
          </div>
          <ErrorMessage error={error} />
        </Modal>
      )
    }
    if (view === 'login') {
      return (
        <Modal
          open={view === 'login'}
          handleClose={() => setView(null)}
          title='Login'
          isDarkMode={isDarkMode}
        >
          <FormInput
            label='Email'
            type='email'
            value={email}
            setValue={setEmail}
            isDarkMode={isDarkMode}
          />
          <FormInput
            label='Password'
            type='password'
            value={password}
            setValue={setPassword}
            onEnter={handleLoginWithEmail}
            isDarkMode={isDarkMode}
          />
          <p className='text-right'>
            <a
              className='text-white hover:underline hover:text-accent-gold cursor-pointer text-sm dark:text-gray-300 dark:hover:text-accent-gold'
              onClick={() => setView('forgotPassword')}
            >
              Forgot Password?
            </a>
          </p>
          <div className='grid grid-cols-2 gap-2'>
            <StyledButton
              onClick={handleLoginWithGoogle}
              text='Login with Google'
              theme='blue-gradient'
            />
            <StyledButton
              onClick={handleLoginWithEmail}
              text='Login with Email'
              theme='light'
            />
          </div>

          <Divider className='my-4 dark:bg-gray-600' />
          <p className='text-center text-white text-sm dark:text-gray-300'>
            {' '}
            Don&#39;t have an account?{' '}
          </p>
          <StyledButton
            onClick={() => {
              setView('signup')
            }}
            text='Sign Up'
            theme='gradient'
            className='w-full'
          />
          <ErrorMessage error={error} />
        </Modal>
      )
    }
    return null
  }

  return (
    <>
      <AuthButton
        fixed={fixedButton}
        compact={compact}
        onClick={
          user
            ? (e: React.MouseEvent<HTMLButtonElement>) =>
                setAnchorEl(e.currentTarget)
            : () => setView('login')
        }
      />
      <LoadingBackdrop loading={loading} />
      {getView()}
    </>
  )
}

export default AuthModal
