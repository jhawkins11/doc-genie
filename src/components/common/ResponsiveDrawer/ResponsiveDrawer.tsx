import { Drawer, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'
import styles from './ResponsiveDrawer.module.css'

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
  const isSmallScreen = useMediaQuery('(max-width: 900px)')

  return (
    <Drawer
      onClose={() => setMobileOpen(false)}
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      sx={{
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 },
      }}
      open={!isSmallScreen || mobileOpen}
    >
      <div className={styles.sidebar}>{children}</div>
    </Drawer>
  )
}

export default ResponsiveDrawer
