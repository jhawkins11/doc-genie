import { ErrorAlert } from '@/components/ErrorAlert/ErrorAlert'
import { ErrorProvider } from '@/lib/contexts/ErrorContext'
import '@/styles/globals.css'
import { ThemeProvider } from '@emotion/react'
import { StyledEngineProvider, CssBaseline, createTheme } from '@mui/material'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useState, useMemo } from 'react'
import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext'

interface ThemedAppProps {
  Component: AppProps['Component']
  pageProps: AppProps['pageProps']
}

const ThemedApp = ({ Component, pageProps }: ThemedAppProps) => {
  const { isDarkMode } = useDarkMode()

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
        },
      }),
    [isDarkMode]
  )

  return (
    <>
      <StyledEngineProvider injectFirst>
        <CssBaseline />
        <ThemeProvider theme={theme}>
          <ErrorAlert />
          <Head>
            <title>Doc Genie</title>
          </Head>
          <Component {...pageProps} />
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorProvider>
      <DarkModeProvider>
        <ThemedApp Component={Component} pageProps={pageProps} />
      </DarkModeProvider>
    </ErrorProvider>
  )
}
