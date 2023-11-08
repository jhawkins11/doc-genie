import { Drawer } from '@mui/material'

const ResponsiveDrawer = ({
  children,
  mobileOpen,
  setMobileOpen,
}: {
  children: React.ReactNode
  mobileOpen: boolean
  setMobileOpen: (bool: boolean) => void
}) => {
  const container =
    window !== undefined ? () => window.document.body : undefined
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 900

  return (
    <Drawer
      ModalProps={{
        keepMounted: true,
      }}
      onClose={() => setMobileOpen(false)}
      container={container}
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      sx={{
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
      }}
      open={!isSmallScreen || mobileOpen}
    >
      {children}
    </Drawer>
  )
}

export default ResponsiveDrawer
