import { useErrorContext } from '@/lib/contexts/ErrorContext'
import { Snackbar } from '@mui/material'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

export const ErrorAlert: React.FC<{}> = () => {
  const { error } = useErrorContext()
  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      // middle
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity='warning' className='bg-red-500 text-white'>
        <AlertTitle>Error</AlertTitle>
        {error?.response?.data?.message || error?.message}
      </Alert>
    </Snackbar>
  )
}
