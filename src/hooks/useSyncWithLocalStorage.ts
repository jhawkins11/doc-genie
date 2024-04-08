import { useState } from 'react'

// usage
// const [value, setValue] = useSyncWithLocalStorage('key', initialValue)
// example
// const [name, setName] = useSyncWithLocalStorage('name', 'John Doe')
export const useSyncWithLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    }
    return initialValue
  })

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(newValue))
    }
  }

  return [value, setStoredValue]
}
