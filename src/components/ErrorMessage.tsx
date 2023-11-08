import { getFirebaseErrorMessage } from '@/utils/firebaseUtils'
import { Typography } from '@mui/material'
import React from 'react'

const ErrorMessage = ({ error }: { error: Error | null }) => {
  return (
    <>
      {error && (
        <Typography
          variant='body1'
          className='text-center mt-4 text-red-400 font-bold text-sm'
        >
          {getFirebaseErrorMessage(error.message)}
        </Typography>
      )}
    </>
  )
}

export default ErrorMessage
