import React, { useState } from 'react'
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

function AuthModal() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [view, setView] = useState<'login' | 'signup' | 'forgotPassword'>(null)
  const clear = () => {
    setEmail('')
    setPassword('')
    setError(null)
  }
  const handleAuthAction = async (action: () => Promise<any>) => {
    await tryCatch(async () => {
      await action()
      clear()
      setView(null)
    }, setError)
  }

  const handleLoginWithEmail = async () => {
    await handleAuthAction(() => loginWithEmail(email, password))
  }
  const handleLogout = async () => {
    await handleAuthAction(logout)
  }
  const handleSignupWithEmail = async () => {
    await handleAuthAction(() => signupWithEmail(email, password))
  }
  const handleResetPassword = async () => {
    await handleAuthAction(() => resetPassword(email))
  }
  const handleLoginWithGoogle = async () => {
    await handleAuthAction(loginWithGoogle)
  }

  const [user, loading] = useAuthState(auth)

  const getView = () => {
    if (view === 'forgotPassword') {
      return (
        <Modal
          open={view === 'forgotPassword'}
          handleClose={() => setView(null)}
          title='Forgot Password'
        >
          <FormInput
            label='Email'
            type='email'
            value={email}
            setValue={setEmail}
            onEnter={() => {
              resetPassword(email)
              setView(null)
            }}
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
        >
          <FormInput
            label='Email'
            type='email'
            value={email}
            setValue={setEmail}
          />
          <FormInput
            label='Password'
            type='password'
            value={password}
            setValue={setPassword}
            onEnter={() => {
              signupWithEmail(email, password)
              setView(null)
            }}
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
        >
          <FormInput
            label='Email'
            type='email'
            value={email}
            setValue={setEmail}
          />
          <FormInput
            label='Password'
            type='password'
            value={password}
            setValue={setPassword}
            onEnter={handleLoginWithEmail}
          />
          <p className='text-right'>
            <a
              className='text-white hover:underline cursor-pointer text-sm'
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

          <Divider className='my-4' />
          <p className='text-center text-white text-sm'>
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
  }

  return (
    <>
      <AuthButton onClick={() => setView('login')} />
      <LoadingBackdrop loading={loading} />
      {getView()}
    </>
  )
}

export default AuthModal
