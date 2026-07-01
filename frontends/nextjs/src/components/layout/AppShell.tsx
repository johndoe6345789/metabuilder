/**
 * AppShell Layout Component
 *
 * The main authenticated layout matching the Qt6 App.qml structure:
 * - AppBar (header with branding, level nav, auth controls)
 * - DBAL offline banner
 * - Sidebar (level-filtered nav) + Main content area
 *
 * This is the 5-level layout system ported from old/src/components/Level[1-5].tsx
 * to a unified shell that adapts based on auth level.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { useTheme } from '@/app/providers'
import { AppBarComponent } from './AppBar'
import { Sidebar } from './Sidebar'
import { DbalBanner } from './DbalBanner'
import { PackageStyleLoader } from '@/components/PackageStyleLoader'
import { getRoleLevel } from '@/lib/constants'
import type { PackageNavItem } from '@/lib/packages/navigation'
import { packageMetadataToNavItem } from '@/lib/packages/navigation'

const LEVEL_PACKAGES: Record<number, string[]> = {
  0: ['global'],
  1: ['global'],
  2: ['global', 'ui_level2'],
  3: ['global', 'ui_level2'],
  4: ['global', 'ui_level4'],
  5: ['global', 'ui_level4'],
}

export interface AppShellProps {
  children: React.ReactNode
}

/** Fetch navigable packages from DBAL or fallback to empty */
async function fetchNavigablePackages(): Promise<PackageNavItem[]> {
  try {
    const dbalUrl = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
    const res = await fetch(`${dbalUrl}/system/core/InstalledPackage`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return []
    const json = await res.json() as { data?: Array<Record<string, unknown>> }
    if (!Array.isArray(json.data)) return []
    return json.data
      .filter((pkg): pkg is Record<string, unknown> => typeof pkg === 'object' && pkg !== null)
      .map(pkg => packageMetadataToNavItem(pkg as {
        packageId: string
        name: string
        navLabel?: string
        icon?: string
        level?: number
        category?: string
        showInNav?: boolean
      }))
      .filter(pkg => pkg.showInNav)
  } catch {
    return []
  }
}

export function AppShell({ children }: AppShellProps) {
  const auth = useAuthContext()
  const { toggleTheme, resolvedMode } = useTheme()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )
  const [dbalOffline, setDbalOffline] = useState(false)
  const [packages, setPackages] = useState<PackageNavItem[]>([])

  const userLevel = auth.user != null
    ? getRoleLevel(auth.user.role ?? 'user')
    : 0

  const username = auth.user?.username ?? auth.user?.name ?? 'User'
  const role = auth.user?.role ?? 'public'

  useEffect(() => {
    // Check DBAL health
    const dbalUrl = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
    fetch(`${dbalUrl}/health`, { signal: AbortSignal.timeout(3000) })
      .then(res => { setDbalOffline(!res.ok) })
      .catch(() => { setDbalOffline(true) })

    // Load navigable packages
    void fetchNavigablePackages().then(setPackages)
  }, [])

  const handleLogout = useCallback(async () => {
    await auth.logout()
    router.push('/')
  }, [auth, router])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PackageStyleLoader packages={LEVEL_PACKAGES[userLevel] ?? []} />
      {/* App Bar */}
      <AppBarComponent
        username={username}
        role={role}
        userLevel={userLevel}
        isAuthenticated={auth.isAuthenticated}
        onLogout={() => { void handleLogout() }}
        onToggleSidebar={handleToggleSidebar}
        onToggleTheme={toggleTheme}
        themeMode={resolvedMode}
        dbalConnected={!dbalOffline}
      />

      {/* DBAL offline banner */}
      <DbalBanner visible={dbalOffline} />

      {/* Main area: Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar (only shown when authenticated, mirrors Qt6 visible: loggedIn) */}
        {auth.isAuthenticated && sidebarOpen && (
          <Sidebar
            userLevel={userLevel}
            username={username}
            role={role}
            packages={packages}
          />
        )}

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            backgroundColor: 'var(--mat-sys-background, #f4f0f9)',
            color: 'var(--mat-sys-on-background)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
