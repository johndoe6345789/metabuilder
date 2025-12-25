'use client'

import { useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lightTheme, darkTheme } from '@/theme/mui-theme'
import { ThemeContext, type ThemeMode } from './theme-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  const [mode, setMode] = useState<ThemeMode>('system')

  const theme = useMemo(() => {
    if (mode === 'system') {
      // Detect system preference
      const isDark = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
      return isDark ? darkTheme : lightTheme
    }
    return mode === 'dark' ? darkTheme : lightTheme
  }, [mode])

  const toggleTheme = () => {
    setMode(current => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'system'
      return 'light'
    })
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
