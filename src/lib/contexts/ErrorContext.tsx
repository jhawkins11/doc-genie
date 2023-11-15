import { FC, ReactNode, createContext, useContext, useState } from 'react'

interface ErrorContextType {
  error: (Error & { response?: { data: { message: string } } }) | null
  setError: (error: Error | null) => void
}

interface ErrorProviderProps {
  children: ReactNode
}

export const ErrorContext = createContext<ErrorContextType>({
  error: null,
  setError: () => {},
})

export const ErrorProvider: FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null)

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useErrorContext = () => {
  const { error, setError } = useContext(ErrorContext)
  return { error, setError }
}
