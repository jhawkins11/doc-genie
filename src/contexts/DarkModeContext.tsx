import React, { createContext, ReactNode, useContext, useEffect } from 'react'
import { useSyncWithLocalStorage } from '@/hooks/useSyncWithLocalStorage'

type DarkModeContextType = {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined
)

// Helper function to detect user's system preference
const getSystemPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  }
  return false
}

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  // Get the system preference for the initial value
  const systemPrefersDark = getSystemPreference()

  // Use local storage with system preference as fallback
  const [isDarkMode, setIsDarkMode] = useSyncWithLocalStorage<boolean>(
    'isDarkMode',
    systemPrefersDark
  )

  // Listen for changes in system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference (no localStorage item)
      if (localStorage.getItem('isDarkMode') === null) {
        setIsDarkMode(e.matches)
      }
    }

    // Add listener for system preference changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [setIsDarkMode])

  useEffect(() => {
    // Update HTML class when dark mode changes
    const htmlElement = document.documentElement
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
      htmlElement.classList.add('dark')
    } else {
      document.body.classList.remove('dark-mode')
      htmlElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <DarkModeContext.Provider
      value={{ isDarkMode, setIsDarkMode, toggleDarkMode }}
    >
      {children}
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}
