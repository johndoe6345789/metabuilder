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

/** Below this the sidebar is an overlay drawer rather than a column.
 *  Kept in sync with the same breakpoint in AppShell.module.scss. */
const NARROW = '(max-width: 899px)'

export interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const auth = useAuthContext()
  const { toggleTheme, resolvedMode } = useTheme()
  const router = useRouter()
  const params = useParams<{ tenantSlug?: string }>()
  // Starts closed so the server and the first client render agree; the
  // effect below opens it on wide viewports. Reading window.innerWidth in
  // the initial state instead made narrow clients hydrate against a server
  // render that had assumed `true`.
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  // The open/closed state used to be decided once, at mount. Resizing the
  // window never re-ran it, so loading wide and then narrowing left a 288px
  // sidebar pinned over a window that no longer had room for it.
  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const apply = (narrow: boolean) => {
      setSidebarOpen(!narrow)
    }
    apply(mq.matches)
    const onChange = (event: MediaQueryListEvent) => {
      apply(event.matches)
    }
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await auth.logout()
    router.push('/')
  }, [auth, router])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Checked at click time rather than read from state, so following a link
  // always closes the drawer on a narrow viewport even if the breakpoint
  // listener never fired.
  const handleNavigate = useCallback(() => {
    if (window.matchMedia(NARROW).matches) {
      setSidebarOpen(false)
    }
  }, [])

  // The grid column must track whether the Sidebar actually renders, not just
  // whether it is toggled open -- logged out it renders nothing, and reserving
  // the column anyway left a 288px dead gap beside every public page.
  const showSidebar = auth.isAuthenticated && sidebarOpen

  return (
    <div className={`${s.shell} ${showSidebar ? s.sidebarOpen : ''}`}>
      <PackageStyleLoader packages={LEVEL_PACKAGES[userLevel] ?? []} />

      {/* Rendered whenever the sidebar is; CSS hides it above the breakpoint.
          Deciding that here from React state instead would leave the drawer
          uncovered if a breakpoint change were ever missed. */}
      {showSidebar && (
        <button
          type="button"
          className={s.backdrop}
          aria-label="Close sidebar"
          onClick={handleToggleSidebar}
        />
      )}

      {showSidebar && (
        <div className={s.sidebarSlot}>
          <Sidebar
            userLevel={userLevel}
            tenantId={tenantId}
            username={username}
            role={role}
            packages={packages}
            onNavigate={handleNavigate}
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
