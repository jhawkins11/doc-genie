import { Backdrop, CircularProgress } from '@mui/material'
import React from 'react'

const LoadingBackdrop = ({ loading }: { loading: boolean }) => {
  return (
    <Backdrop
      open={loading}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <CircularProgress color='inherit' />
    </Backdrop>
  )
}

export default LoadingBackdrop
