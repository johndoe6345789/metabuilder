'use client'

import { Provider as ReduxProvider } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'

import { CssBaseline } from '@/fakemui'
import { store } from '@/store/store'
import { RetryableErrorBoundary } from '@/components/RetryableErrorBoundary'

import { ThemeContext, type ThemeMode } from './theme-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')

  const resolvedMode = useMemo<Exclude<ThemeMode, 'system'>>(() => {
    if (mode === 'system') {
      return typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }

    return mode
  }, [mode])

  useEffect(() => {
    const root = document.documentElement

    root.dataset.theme = resolvedMode
    root.style.colorScheme = resolvedMode
  }, [resolvedMode])

  const toggleTheme = () => {
    setMode(current => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'system'
      return 'light'
    })
  }

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, toggleTheme }}>
      <CssBaseline />
      <ReduxProvider store={store}>
        <RetryableErrorBoundary
          componentName="Providers"
          maxAutoRetries={3}
          showSupportInfo
          supportEmail="support@metabuilder.dev"
        >
          {children}
        </RetryableErrorBoundary>
      </ReduxProvider>
    </ThemeContext.Provider>
  )
}
