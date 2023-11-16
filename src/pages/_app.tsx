import { ErrorAlert } from '@/components/ErrorAlert/ErrorAlert'
import { ErrorProvider } from '@/lib/contexts/ErrorContext'
import '@/styles/globals.css'
import { ThemeProvider } from '@emotion/react'
import { StyledEngineProvider, CssBaseline, createTheme } from '@mui/material'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  })
  return (
    <ErrorProvider>
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
    </ErrorProvider>
  )
}
