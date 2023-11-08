const tryCatch = async (
  func: () => Promise<void>,
  setError?: (error: Error) => void
) => {
  try {
    await func()
  } catch (error) {
    setError(error as Error)
  }
}

export default tryCatch
