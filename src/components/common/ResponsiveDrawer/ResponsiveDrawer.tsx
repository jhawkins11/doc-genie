import { Drawer, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import styles from './ResponsiveDrawer.module.css'

const ResponsiveDrawer = React.memo(
  ({
    children,
    mobileOpen,
    setMobileOpen,
    className,
    isDarkMode = false,
  }: {
    children: React.ReactNode
    mobileOpen: boolean
    setMobileOpen: (bool: boolean) => void
    className?: string
    isDarkMode?: boolean
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
        <div
          className={`${styles.sidebar} ${
            isDarkMode ? styles.darkSidebar : styles.lightSidebar
          }`}
        >
          {children}
        </div>
      </Drawer>
    )
  }
)

ResponsiveDrawer.displayName = 'ResponsiveDrawer'

export default ResponsiveDrawer
