import { useState } from 'react'
import { Button } from '@mui/material'
import Person from '@mui/icons-material/Person'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'

const AuthButton = ({
  onClick,
  fixed = true,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement> | null) => void
  fixed?: boolean
}) => {
  const [user, loading] = useAuthState(auth)

  const getClassNames = () => {
    const classNames =
      'bg-black bg-opacity-60 backdrop-blur-sm text-white px-5 py-2 rounded-lg flex items-center hover-lift transition-all duration-300 border border-gray-600 shadow-lg'
    if (fixed) {
      return `${classNames} fixed top-0 right-0 m-6 z-50 animate-fade-in`
    }
    return `${classNames} mt-2 h-full w-full col-span-full animate-fade-in`
  }

  return (
    <Button
      className={getClassNames()}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
      aria-label='login'
    >
      <Person className='animate-pulse-subtle mr-1' />
      <span className='font-medium'>
        {!loading && user ? 'My Account' : 'LOGIN'}
      </span>
    </Button>
  )
}

export default AuthButton
