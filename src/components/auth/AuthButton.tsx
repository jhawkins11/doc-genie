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
    const classNames = 'bg-white text-black px-4 py-2 rounded flex items-center'
    if (fixed) {
      return `${classNames} fixed top-0 right-0 m-6 shadow-md z-50`
    }
    return `${classNames} mt-2 h-full w-full col-span-full`
  }

  return (
    <Button
      className={getClassNames()}
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
