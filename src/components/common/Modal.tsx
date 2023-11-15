import { Dialog, DialogTitle, DialogContent } from '@mui/material'

const Modal = ({
  open,
  handleClose,
  title,
  children,
}: {
  open: boolean
  handleClose: () => void
  title: string
  children: React.ReactNode
}) => {
  const container =
    window !== undefined ? () => window.document.body : undefined
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      container={container}
      disableScrollLock
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className='p-4'>{children}</DialogContent>
    </Dialog>
  )
}

export default Modal
