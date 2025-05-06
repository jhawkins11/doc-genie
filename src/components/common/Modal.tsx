import { Dialog, DialogTitle, DialogContent } from '@mui/material'

const Modal = ({
  open,
  handleClose,
  title,
  children,
  isDarkMode = false,
}: {
  open: boolean
  handleClose: () => void
  title: string
  children: React.ReactNode
  isDarkMode?: boolean
}) => {
  const container =
    window !== undefined ? () => window.document.body : undefined
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      container={container}
      disableScrollLock
      PaperProps={{
        className: isDarkMode ? 'dark:bg-gray-800 dark:text-white' : '',
      }}
    >
      <DialogTitle className='dark:text-gray-100'>{title}</DialogTitle>
      <DialogContent className='p-4 dark:bg-gray-800'>{children}</DialogContent>
    </Dialog>
  )
}

export default Modal
