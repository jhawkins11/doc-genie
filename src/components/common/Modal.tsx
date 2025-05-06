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
        className: 'bg-gray-900 text-white',
        style: { borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' },
      }}
    >
      <DialogTitle className='text-white border-b border-gray-700'>
        {title}
      </DialogTitle>
      <DialogContent className='p-4 bg-gray-900'>{children}</DialogContent>
    </Dialog>
  )
}

export default Modal
