import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'
import { useRouter } from 'next/router'
import AuthButton from './AuthButton'
import LoadingBackdrop from '../common/LoadingBackdrop'
import { UserDropdown } from './components'
import { LoginForm, SignupForm, ForgotPasswordForm } from './forms'
import { useAuthActions, useDropdownPosition } from './hooks'

type AuthView = 'login' | 'signup' | 'forgotPassword'

interface AuthModalProps {
  fixedButton?: boolean
  isDarkMode?: boolean
  compact?: boolean
}

/**
 * Authentication modal component with multiple views (login, signup, password reset)
 * Handles all auth flows including email/password and Google auth
 */
function AuthModal({
  fixedButton = true,
  isDarkMode = false,
  compact = false,
}: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [view, setView] = useState<AuthView | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const [user, loading] = useAuthState(auth)
  const {
    isLoading,
    error,
    clearError,
    handleLoginWithEmail,
    handleSignupWithEmail,
    handleResetPassword,
    handleLoginWithGoogle,
    handleLogout,
  } = useAuthActions()

  const dropdownPosition = useDropdownPosition(
    anchorEl,
    dropdownRef,
    compact,
    fixedButton
  )

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

  const clearForm = useCallback(() => {
    setEmail('')
    setPassword('')
    clearError()
  }, [clearError])

  const closeModal = useCallback(() => {
    clearForm()
    setView(null)
    setAnchorEl(null)
  }, [clearForm])

  const navigateToMyDocs = useCallback(() => {
    router.push('/docs')
    setAnchorEl(null)
  }, [router])

  const handleLogin = useCallback(() => {
    handleLoginWithEmail(email, password, closeModal)
  }, [handleLoginWithEmail, email, password, closeModal])

  const handleSignup = useCallback(() => {
    handleSignupWithEmail(email, password, closeModal)
  }, [handleSignupWithEmail, email, password, closeModal])

  const handlePasswordReset = useCallback(() => {
    handleResetPassword(email, closeModal)
  }, [handleResetPassword, email, closeModal])

  const handleGoogleAuth = useCallback(() => {
    handleLoginWithGoogle(closeModal)
  }, [handleLoginWithGoogle, closeModal])

  const handleUserLogout = useCallback(() => {
    handleLogout(closeModal)
  }, [handleLogout, closeModal])

  const renderUserDropdown = () => {
    if (!user || !anchorEl) return null

    return (
      <UserDropdown
        user={user}
        dropdownPosition={dropdownPosition}
        dropdownRef={dropdownRef}
        onNavigateToMyDocs={navigateToMyDocs}
        onLogout={handleUserLogout}
      />
    )
  }

  const renderModalView = () => {
    switch (view) {
      case 'login':
        return (
          <LoginForm
            isOpen={view === 'login'}
            onClose={() => setView(null)}
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleAuth}
            onForgotPassword={() => setView('forgotPassword')}
            onSwitchToSignup={() => setView('signup')}
          />
        )
      case 'signup':
        return (
          <SignupForm
            isOpen={view === 'signup'}
            onClose={() => setView(null)}
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSignup={handleSignup}
            onGoogleLogin={handleGoogleAuth}
            onSwitchToLogin={() => setView('login')}
          />
        )
      case 'forgotPassword':
        return (
          <ForgotPasswordForm
            isOpen={view === 'forgotPassword'}
            onClose={() => setView(null)}
            email={email}
            error={error}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onResetPassword={handlePasswordReset}
          />
        )
      default:
        return null
    }
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
      {user && anchorEl ? renderUserDropdown() : renderModalView()}
    </>
  )
}

export default AuthModal
