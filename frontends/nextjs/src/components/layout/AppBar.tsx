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

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getLevelColor } from '@/lib/packages/navigation'
import { Logo } from '@/components/brand/Logo'
import { SunIcon, MoonIcon, LogoutIcon } from './AppBarIcons'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'
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

/** Level navigation mapping (mirrors Qt6 App.qml Repeater model) */
const levelNavItems = [
  { label: 'Public', level: 1, path: '/' },
  { label: 'User', level: 1, path: '/dashboard' },
  { label: 'Admin', level: 2, path: '/admin' },
  { label: 'God', level: 4, path: '/god-panel' },
  { label: 'Super God', level: 5, path: '/super-god-panel' },
]

function isActivePath(pathname: string, path: string): boolean {
  return path === '/'
    ? pathname === '/'
    : pathname === path || pathname.startsWith(path + '/')
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
  const router = useRouter()
  const pathname = usePathname()
  const [checkingDbal, setCheckingDbal] = useState(true)
  const [dbalStatus, setDbalStatus] = useState(dbalConnected)

  useEffect(() => {
    const dbalUrl =
      process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
    fetch(`${dbalUrl}/health`, { signal: AbortSignal.timeout(3000) })
      .then(res => {
        setDbalStatus(res.ok)
        setCheckingDbal(false)
      })
      .catch(() => {
        setDbalStatus(false)
        setCheckingDbal(false)
      })
  }, [])

  const levelColor = getLevelColor(userLevel)
  const levelItems = levelNavItems.map(item =>
    item.path === '/god-panel'
      ? { ...item, path: tenantGodPanelPath(tenantId) }
      : item
  )
  const visibleLevelItems = levelItems.filter(item =>
    isAuthenticated ? item.level <= userLevel : item.level <= 1
  )

  const dbalState = checkingDbal ? 'checking' : dbalStatus ? 'online' : 'offline'
  const dbalTitle = `DBAL ${dbalState}`
  const initial = (username ?? '?').charAt(0).toUpperCase()

  return (
    <header
      role="banner"
      className={s.root}
      style={{ '--level-accent': levelColor } as CSSProperties}
    >
      {/* ── Left zone: menu, brand, level badge ─────────────────────── */}
      <div className={s.left}>
        {isAuthenticated && onToggleSidebar != null && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={s.iconButton}
            aria-label="Toggle sidebar"
          >
            <span className={s.menuIcon} aria-hidden="true">
              &#9776;
            </span>
          </button>
        )}

        <Link href="/" className={s.brand}>
          <Logo size={30} />
          <span className={s.brandText}>
            <span className={s.brandTitle}>MetaBuilder</span>
            <span className={s.version}>
              v{process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'}
            </span>
          </span>
        </Link>

        {isAuthenticated && (
          <span className={s.levelChip} title={`Level ${userLevel}`}>
            <span className={s.levelChipLong}>Level {userLevel}</span>
            <span className={s.levelChipShort}>L{userLevel}</span>
          </span>
        )}
      </div>

      {/* ── Centre zone: level navigation (segmented) ───────────────── */}
      {visibleLevelItems.length > 0 && (
        <nav className={s.levelNav} aria-label="Level navigation">
          {visibleLevelItems.map(item => (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                router.push(item.path)
              }}
              className={`${s.navButton} ${
                isActivePath(pathname, item.path) ? s.navButtonActive : ''
              }`}
              aria-current={
                isActivePath(pathname, item.path) ? 'page' : undefined
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* ── Right zone: status, theme, auth ─────────────────────────── */}
      <div className={s.right}>
        <span
          className={`${s.dbalStatus} ${s[dbalState]}`}
          title={dbalTitle}
          aria-label={dbalTitle}
        >
          <span className={s.dbalDot} aria-hidden="true" />
          <span className={s.dbalText}>DBAL</span>
        </span>

        {onToggleTheme != null && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={s.iconButton}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} theme`}
            aria-label={`Switch to ${
              themeMode === 'dark' ? 'light' : 'dark'
            } theme`}
          >
            {themeMode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        )}

        <span className={s.rule} aria-hidden="true" />

        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              router.push('/login')
            }}
            className={s.primaryButton}
          >
            Login
          </button>
        ) : (
          <div className={s.authControls}>
            <span className={s.userChip} title={`${username} (${role})`}>
              <span className={s.avatar} aria-hidden="true">
                {initial}
              </span>
              <span className={s.userText}>
                <span className={s.userName}>{username}</span>
                <span className={s.userRole}>{role}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className={s.ghostButton}
              title="Logout"
              aria-label="Logout"
            >
              <span className={s.ghostButtonLabel}>Logout</span>
              <LogoutIcon className={s.ghostButtonIcon} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
