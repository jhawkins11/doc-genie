import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
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
  return false // Default for server-side or if window is not available
}

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with a default that is consistent on server and client (e.g., false for light mode)
  // The actual value will be set after hydration via useEffect.
  const [isDarkModeState, setIsDarkModeState] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)

  // useSyncWithLocalStorage will be used to persist changes and sync across tabs,
  // but its initial read will be managed by our useEffect.
  const [storedIsDarkMode, setStoredIsDarkMode] =
    useSyncWithLocalStorage<boolean>(
      'isDarkMode',
      false // Initial default for useSyncWithLocalStorage, will be overridden by effect
    )

  useEffect(() => {
    setIsMounted(true)
    // Determine initial dark mode state once component is mounted on the client
    const systemPrefersDark = getSystemPreference()
    const localStorageValue = localStorage.getItem('isDarkMode')

    if (localStorageValue !== null) {
      setIsDarkModeState(localStorageValue === 'true')
    } else {
      setIsDarkModeState(systemPrefersDark)
    }
  }, [])

  // Effect to update localStorage and body classes when isDarkModeState changes *after* initial mount determination
  useEffect(() => {
    if (isMounted) {
      // Only run after initial state has been determined client-side
      setStoredIsDarkMode(isDarkModeState)
      const htmlElement = document.documentElement
      if (isDarkModeState) {
        document.body.classList.add('dark-mode')
        htmlElement.classList.add('dark')
      } else {
        document.body.classList.remove('dark-mode')
        htmlElement.classList.remove('dark')
      }
    }
  }, [isDarkModeState, isMounted, setStoredIsDarkMode])

  // System preference change listener - also gated by isMounted
  useEffect(() => {
    if (!isMounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference (no localStorage item)
      if (localStorage.getItem('isDarkMode') === null) {
        setIsDarkModeState(e.matches)
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [isMounted])

  const toggleDarkMode = () => {
    if (isMounted) {
      // Ensure toggle only works after mount
      setIsDarkModeState((prev) => !prev)
    }
  }

  // The context now provides isDarkModeState and a way to set it (setIsDarkModeState)
  // which will then trigger the useEffect to update localStorage etc.
  return (
    <DarkModeContext.Provider
      value={{
        isDarkMode: isDarkModeState,
        setIsDarkMode: setIsDarkModeState,
        toggleDarkMode,
      }}
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
