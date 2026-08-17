'use client'

import { Provider as ReduxProvider } from 'react-redux'
import { usePersistGate } from '@metabuilder/redux-persist'
import { useEffect, useMemo, useState } from 'react'

import { CssBaseline } from '@/m3'
import { store, persistor } from '@/store/store'
import { RetryableErrorBoundary } from '@/components/RetryableErrorBoundary'
import { resolveTenantTheme, applyTenantTheme } from '@/components/theme-editor/apply-tenant-theme'

import { ThemeContext, type ThemeMode } from './theme-context'

function PersistGate({ children }: { children: React.ReactNode }) {
  const isRehydrated = usePersistGate(persistor)

  if (!isRehydrated) {
    return null
  }

  return <>{children}</>
}

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

  // God Panel's Theme tab persists color overrides to a per-tenant DBAL row
  // (see apply-tenant-theme.ts) precisely so they're visible to every
  // visitor, not just an editor who happens to have that tab open -- this is
  // the app-wide consumer that makes that true. Runs once per mount; a
  // change made mid-session by someone else appears on this visitor's next
  // load, not live, which matches how the rest of the app's God-Panel-
  // published content (WorkspacePageSlot) behaves.
  useEffect(() => {
    let cancelled = false
    resolveTenantTheme().then(theme => {
      if (!cancelled) applyTenantTheme(theme, resolvedMode)
    }).catch(() => {
      // resolveTenantTheme already falls back internally; nothing left to do
    })
    return () => {
      cancelled = true
    }
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
        <PersistGate>
          <RetryableErrorBoundary
            componentName="Providers"
            maxAutoRetries={3}
            showSupportInfo
            supportEmail="support@metabuilder.dev"
          >
            {children}
          </RetryableErrorBoundary>
        </PersistGate>
      </ReduxProvider>
    </ThemeContext.Provider>
  )
}
