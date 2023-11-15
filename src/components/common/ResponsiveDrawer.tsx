import { Drawer, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'

const ResponsiveDrawer = ({
  children,
  mobileOpen,
  setMobileOpen,
}: {
  children: React.ReactNode
  mobileOpen: boolean
  setMobileOpen: (bool: boolean) => void
}) => {
  const isSmallScreen = useMediaQuery('(max-width: 900px)')

  return (
    <Drawer
      ModalProps={{
        keepMounted: true,
      }}
      onClose={() => setMobileOpen(false)}
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
