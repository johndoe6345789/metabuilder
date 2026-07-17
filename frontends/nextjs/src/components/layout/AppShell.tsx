/**
 * AppShell Layout Component
 *
 * The main authenticated layout matching the Qt6 App.qml structure:
 * - AppBar (header with branding, level nav, auth controls)
 * - DBAL offline banner
 * - Sidebar (level-filtered nav) + Main content area
 *
 * This is the 5-level layout system ported from old level components to a
 * unified shell that adapts based on auth level.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { useTheme } from '@/app/providers'
import { AppBarComponent } from './AppBar'
import { Sidebar } from './Sidebar'
import { DbalBanner } from './DbalBanner'
import { PackageStyleLoader } from '@/components/PackageStyleLoader'
import { getRoleLevel } from '@/lib/constants'
import type { PackageNavItem } from '@/lib/packages/navigation'
import {
  fetchDbalHealth,
  fetchNavigablePackages,
  LEVEL_PACKAGES,
} from './app-shell-data'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import s from './AppShell.module.scss'

export interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const auth = useAuthContext()
  const { toggleTheme, resolvedMode } = useTheme()
  const router = useRouter()
  const params = useParams<{ tenantSlug?: string }>()
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )
  const [dbalOffline, setDbalOffline] = useState(false)
  const [packages, setPackages] = useState<PackageNavItem[]>([])

  const userLevel =
    auth.user != null ? getRoleLevel(auth.user.role ?? 'user') : 0

  const username = auth.user?.username ?? auth.user?.name ?? 'User'
  const role = auth.user?.role ?? 'public'
  const tenantId = normalizeTenantId(params.tenantSlug ?? auth.user?.tenantId)

  useEffect(() => {
    void fetchDbalHealth().then(setDbalOffline)
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
    <div className={`${s.shell} ${sidebarOpen ? s.sidebarOpen : ''}`}>
      <PackageStyleLoader packages={LEVEL_PACKAGES[userLevel] ?? []} />

      {auth.isAuthenticated && sidebarOpen && (
        <div className={s.sidebarSlot}>
          <Sidebar
            userLevel={userLevel}
            tenantId={tenantId}
            username={username}
            role={role}
            packages={packages}
          />
        </div>
      )}

      <div className={s.appBarSlot}>
        <AppBarComponent
          username={username}
          role={role}
          userLevel={userLevel}
          tenantId={tenantId}
          isAuthenticated={auth.isAuthenticated}
          onLogout={() => {
            void handleLogout()
          }}
          onToggleSidebar={handleToggleSidebar}
          onToggleTheme={toggleTheme}
          themeMode={resolvedMode}
          dbalConnected={!dbalOffline}
        />
      </div>

      <div className={s.bannerSlot}>
        <DbalBanner visible={dbalOffline} />
      </div>

      <div className={s.body}>
        <main className={s.main}>{children}</main>
      </div>
    </div>
  )
}
