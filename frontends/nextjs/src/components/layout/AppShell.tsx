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

import { useTheme } from '@/app/providers'
import { AppBarComponent } from './AppBar'
import { DbalBanner } from './DbalBanner'
import { PackageStyleLoader } from '@/components/PackageStyleLoader'
import { LEVEL_PACKAGES } from './app-shell-data'
import { ShellSidebarSlot } from './ShellSidebarSlot'
import { useAppShell } from './use-app-shell'
import s from './AppShell.module.scss'

export interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { toggleTheme, resolvedMode } = useTheme()
  const shell = useAppShell()

  return (
    <div className={`${s.shell} ${shell.showSidebar ? s.sidebarOpen : ''}`}>
      <PackageStyleLoader packages={LEVEL_PACKAGES[shell.userLevel] ?? []} />
      <ShellSidebarSlot shell={shell} />

      <div className={s.appBarSlot}>
        <AppBarComponent
          username={shell.username}
          role={shell.role}
          userLevel={shell.userLevel}
          tenantId={shell.tenantId}
          isAuthenticated={shell.auth.isAuthenticated}
          onLogout={() => {
            void shell.logout()
          }}
          onToggleSidebar={shell.toggleSidebar}
          onToggleTheme={toggleTheme}
          themeMode={resolvedMode}
          dbalConnected={!shell.dbalOffline}
        />
      </div>

      <div className={s.bannerSlot}>
        <DbalBanner visible={shell.dbalOffline} />
      </div>

      <div className={s.body}>
        <main className={s.main}>{children}</main>
      </div>
    </div>
  )
}
