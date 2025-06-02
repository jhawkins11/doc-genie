import React from 'react'
import Modal from '../components/Modal'
import StyledInput from '../components/StyledInput'
import StyledButton from '../components/StyledButton'

interface ForgotPasswordFormProps {
  isOpen: boolean
  onClose: () => void
  email: string
  error: Error | null
  isLoading: boolean
  onEmailChange: (email: string) => void
  onResetPassword: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  isOpen,
  onClose,
  email,
  error,
  isLoading,
  onEmailChange,
  onResetPassword,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title='Reset Password'>
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-white'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <p className='text-white/80 text-sm'>
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <StyledInput
        label='Email Address'
        type='email'
        value={email}
        onChange={onEmailChange}
        placeholder='Enter your email'
        onKeyDown={(e) => e.key === 'Enter' && onResetPassword()}
      />

      {error && (
        <div className='p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl'>
          <p className='text-red-300 text-sm text-center'>{error.message}</p>
        </div>
      )}

      <div className='grid grid-cols-2 gap-4'>
        <StyledButton onClick={onClose} variant='secondary'>
          Cancel
        </StyledButton>
        <StyledButton onClick={onResetPassword} loading={isLoading}>
          Send Reset Link
        </StyledButton>
      </div>
    </div>
  </Modal>
)

export default ForgotPasswordForm
