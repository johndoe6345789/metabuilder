/**
 * AppBar Component
 *
 * Top navigation bar matching Qt6 App.qml header:
 * - MetaBuilder branding + level badge
 * - DBAL connection status indicator
 * - Level navigation buttons (visible based on user level)
 * - Theme toggle
 * - Auth controls (login/logout)
 *
 * Responsiveness is driven by @container queries against `.appBarSlot`
 * (AppShell.module.scss), not the viewport — the bar shares its row with the
 * sidebar, so window width says nothing about the space it actually has.
 */
'use client'

import type { CSSProperties } from 'react'
import { getLevelColor } from '@/lib/packages/navigation'
import { visibleLevelNavItems } from './app-bar/level-nav-items'
import { useDbalStatus } from './app-bar/use-dbal-status'
import { AppBarBrand } from './app-bar/AppBarBrand'
import { AppBarLevelNav } from './app-bar/AppBarLevelNav'
import { AppBarStatus } from './app-bar/AppBarStatus'
import s from './AppBar.module.scss'

export interface AppBarProps {
  username: string | null
  role: string
  userLevel: number
  tenantId: string
  isAuthenticated: boolean
  onLogout: () => void
  onToggleSidebar?: () => void
  onToggleTheme?: () => void
  themeMode?: 'light' | 'dark'
  dbalConnected?: boolean
}

export function AppBarComponent({
  username,
  role,
  userLevel,
  tenantId,
  isAuthenticated,
  onLogout,
  onToggleSidebar,
  onToggleTheme,
  themeMode = 'dark',
  dbalConnected = false,
}: AppBarProps) {
  const dbalState = useDbalStatus(dbalConnected)
  const levelColor = getLevelColor(userLevel)
  const levelItems = visibleLevelNavItems(tenantId, isAuthenticated, userLevel)

  return (
    <header
      role="banner"
      className={s.root}
      style={{ '--level-accent': levelColor } as CSSProperties}
    >
      <AppBarBrand
        isAuthenticated={isAuthenticated}
        userLevel={userLevel}
        onToggleSidebar={onToggleSidebar}
      />
      <AppBarLevelNav items={levelItems} />
      <AppBarStatus
        dbalState={dbalState}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        isAuthenticated={isAuthenticated}
        username={username}
        role={role}
        onLogout={onLogout}
      />
    </header>
  )
}
