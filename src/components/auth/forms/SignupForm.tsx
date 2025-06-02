import React from 'react'
import Modal from '../components/Modal'
import StyledInput from '../components/StyledInput'
import StyledButton from '../components/StyledButton'
import GoogleIcon from '../components/GoogleIcon'
import Divider from '../components/Divider'

interface SignupFormProps {
  isOpen: boolean
  onClose: () => void
  email: string
  password: string
  error: Error | null
  isLoading: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onSignup: () => void
  onGoogleLogin: () => void
  onSwitchToLogin: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({
  isOpen,
  onClose,
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSignup,
  onGoogleLogin,
  onSwitchToLogin,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title='Create Account'>
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
          placeholder='Create a password'
          onKeyDown={(e) => e.key === 'Enter' && onSignup()}
        />
      </div>

      {error && (
        <div className='p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl'>
          <p className='text-red-300 text-sm text-center'>{error.message}</p>
        </div>
      )}

      <div className='space-y-3'>
        <StyledButton onClick={onSignup} loading={isLoading}>
          Create Account
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
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className='text-purple-300 hover:text-purple-200 font-medium transition-colors duration-200'
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  </Modal>
)

export default SignupForm
