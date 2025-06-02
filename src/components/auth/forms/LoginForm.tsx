import React from 'react'
import Modal from '../components/Modal'
import StyledInput from '../components/StyledInput'
import StyledButton from '../components/StyledButton'
import GoogleIcon from '../components/GoogleIcon'
import Divider from '../components/Divider'

interface LoginFormProps {
  isOpen: boolean
  onClose: () => void
  email: string
  password: string
  error: Error | null
  isLoading: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onLogin: () => void
  onGoogleLogin: () => void
  onForgotPassword: () => void
  onSwitchToSignup: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({
  isOpen,
  onClose,
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onSwitchToSignup,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title='Welcome Back'>
    <div className='space-y-6'>
      <div className='space-y-4'>
        <StyledInput
          label='Email Address'
          type='email'
          value={email}
          onChange={onEmailChange}
          placeholder='Enter your email'
        />
        <StyledInput
          label='Password'
          type='password'
          value={password}
          onChange={onPasswordChange}
          placeholder='Enter your password'
          onKeyDown={(e) => e.key === 'Enter' && onLogin()}
        />
      </div>

      <div className='text-right'>
        <button
          onClick={onForgotPassword}
          className='text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors duration-200'
        >
          Forgot your password?
        </button>
      </div>

      {error && (
        <div className='p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl'>
          <p className='text-red-300 text-sm text-center'>{error.message}</p>
        </div>
      )}

      <div className='space-y-3'>
        <StyledButton onClick={onLogin} loading={isLoading}>
          Sign In
        </StyledButton>

        <Divider />

        <StyledButton
          onClick={onGoogleLogin}
          variant='google'
          loading={isLoading}
        >
          <div className='flex items-center justify-center space-x-2'>
            <GoogleIcon />
            <span>Continue with Google</span>
          </div>
        </StyledButton>
      </div>

      <div className='text-center'>
        <p className='text-white/60 text-sm'>
          Don&apos;t have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className='text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200'
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  </Modal>
)

export default LoginForm
