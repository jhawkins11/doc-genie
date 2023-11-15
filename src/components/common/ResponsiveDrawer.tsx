import { Drawer, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'

const ResponsiveDrawer = ({
  children,
  mobileOpen,
  setMobileOpen,
  className,
}: {
  children: React.ReactNode
  mobileOpen: boolean
  setMobileOpen: (bool: boolean) => void
  className?: string
}) => {
  const container =
    window !== undefined ? () => window.document.body : undefined
  const isSmallScreen = useMediaQuery('(max-width: 900px)')

  return (
    <Drawer
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
