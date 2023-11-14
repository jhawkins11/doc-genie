import { useState } from 'react'
import { Button } from '@mui/material'
import Person from '@mui/icons-material/Person'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/initializeFirebaseApp'

const AuthButton = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement> | null) => void
}) => {
  const [user, loading] = useAuthState(auth)

  return (
    <Button
      className='bg-white text-black px-4 py-2 rounded flex items-center fixed top-0 right-0 m-6 shadow-md z-50'
      sx={{ '&:hover': { backgroundColor: 'lightgrey' } }}
      onClick={onClick}
      aria-label='login'
    >
      <Person />
      {!loading && user ? '' : 'Login'}
    </Button>
  )
}

export default AuthButton
