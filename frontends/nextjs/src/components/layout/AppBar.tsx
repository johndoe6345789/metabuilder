/**
 * AppBar Component
 *
 * Top navigation bar matching Qt6 App.qml header:
 * - MetaBuilder branding + level badge
 * - DBAL connection status indicator
 * - Level navigation buttons (visible based on user level)
 * - Theme toggle
 * - Auth controls (login/logout)
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AppBar as MuiAppBar,
  Typography,
  Button,
  Chip,
  IconButton,
} from '@/m3'
import { getLevelColor } from '@/lib/packages/navigation'
import { Logo } from '@/components/brand/Logo'
import s from './AppBar.module.scss'

export interface AppBarProps {
  username: string | null
  role: string
  userLevel: number
  isAuthenticated: boolean
  onLogout: () => void
  onToggleSidebar?: () => void
  onToggleTheme?: () => void
  themeMode?: 'light' | 'dark'
  dbalConnected?: boolean
}

/** Level navigation mapping (mirrors Qt6 App.qml Repeater model) */
const levelNavItems = [
  { label: 'Public',    level: 1, path: '/' },
  { label: 'User',      level: 1, path: '/app/dashboard' },
  { label: 'Admin',     level: 2, path: '/app/admin' },
  { label: 'God',       level: 4, path: '/app/god-panel' },
  { label: 'Super God', level: 5, path: '/app/supergod' },
]

export function AppBarComponent({
  username,
  role,
  userLevel,
  isAuthenticated,
  onLogout,
  onToggleSidebar,
  onToggleTheme,
  themeMode = 'dark',
  dbalConnected = false,
}: AppBarProps) {
  const router = useRouter()
  const [checkingDbal, setCheckingDbal] = useState(true)
  const [dbalStatus, setDbalStatus] = useState(dbalConnected)

  useEffect(() => {
    const dbalUrl = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
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

  return (
    <MuiAppBar
      position="sticky"
      className={s.root}
    >
      {/* Menu toggle (for mobile) */}
      {isAuthenticated && onToggleSidebar != null && (
        <IconButton
          color="inherit"
          onClick={onToggleSidebar}
          className={s.menuButton}
          aria-label="Toggle sidebar"
        >
          <span className={s.menuIcon}>&#9776;</span>
        </IconButton>
      )}

      {/* Branding */}
      <Link href="/" className={s.brand}>
        <Logo size={32} />
        <Typography variant="h6" noWrap className={s.brandTitle}>
          MetaBuilder
        </Typography>
        <Typography
          variant="caption"
          noWrap
          className={s.version}
        >
          v{process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0'}
        </Typography>
      </Link>

      {/* Level badge */}
      {isAuthenticated && (
        <Chip
          label={`Level ${userLevel}`}
          size="small"
          className={s.levelChip}
          style={{ backgroundColor: levelColor }}
        />
      )}

      {/* DBAL connection status */}
      <div className={s.dbalStatus}>
        <div
          className={s.dbalDot}
          style={{ backgroundColor: checkingDbal ? '#ff9800' : dbalStatus ? '#4caf50' : '#f44336' }}
        />
        <Typography variant="caption" className={s.dbalText}>
          DBAL
        </Typography>
      </div>

      {/* Theme toggle */}
      {onToggleTheme != null && (
        <Button
          variant="text"
          size="small"
          onClick={onToggleTheme}
          className={s.textButton}
        >
          {themeMode === 'dark' ? 'Light' : 'Dark'}
        </Button>
      )}

      {/* Spacer */}
      <div className={s.spacer} />

      {/* Level navigation (mirrors Qt6 Repeater) */}
      <div className={s.levelNav}>
        {levelNavItems
          .filter(item => isAuthenticated ? item.level <= userLevel : item.level <= 1)
          .map(item => (
            <Button
              key={item.path}
              variant="text"
              size="small"
              onClick={() => { router.push(item.path) }}
              className={s.navButton}
            >
              {item.label}
            </Button>
          ))}
      </div>

      {/* Spacer */}
      <div className={s.smallSpacer} />

      {/* Auth controls */}
      {!isAuthenticated ? (
        <Button
          variant="contained"
          size="small"
          onClick={() => { router.push('/ui/login') }}
          className={s.textButton}
        >
          Login
        </Button>
      ) : (
        <div className={s.authControls}>
          <Typography variant="body2" className={s.userLabel}>
            {username} ({role})
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={onLogout}
            className={s.textButton}
          >
            Logout
          </Button>
        </div>
      )}
    </MuiAppBar>
  )
}
