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
  Avatar,
  IconButton,
} from '@/m3'
import { getLevelLabel, getLevelColor } from '@/lib/packages/navigation'

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
      sx={{
        height: 56,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        px: 2,
        gap: 1.5,
        zIndex: 1200,
      }}
    >
      {/* Menu toggle (for mobile) */}
      {isAuthenticated && onToggleSidebar != null && (
        <IconButton
          color="inherit"
          onClick={onToggleSidebar}
          sx={{ display: { sm: 'none' }, mr: 0.5 }}
          aria-label="Toggle sidebar"
        >
          <span style={{ fontSize: '1.25rem' }}>&#9776;</span>
        </IconButton>
      )}

      {/* Branding */}
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary, #6200ee), var(--accent, #03dac6))',
          }}
        />
        <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
          MetaBuilder
        </Typography>
      </Link>

      {/* Level badge */}
      {isAuthenticated && (
        <Chip
          label={`Level ${userLevel}`}
          size="small"
          sx={{
            bgcolor: levelColor,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
          }}
        />
      )}

      {/* DBAL connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: checkingDbal ? '#ff9800' : dbalStatus ? '#4caf50' : '#f44336',
          }}
        />
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          DBAL
        </Typography>
      </div>

      {/* Theme toggle */}
      {onToggleTheme != null && (
        <Button
          variant="text"
          size="small"
          onClick={onToggleTheme}
          sx={{ color: 'inherit', minWidth: 'auto', textTransform: 'none' }}
        >
          {themeMode === 'dark' ? 'Light' : 'Dark'}
        </Button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Level navigation (mirrors Qt6 Repeater) */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {levelNavItems
          .filter(item => isAuthenticated ? item.level <= userLevel : item.level <= 1)
          .map(item => (
            <Button
              key={item.path}
              variant="text"
              size="small"
              onClick={() => { router.push(item.path) }}
              sx={{
                color: 'inherit',
                textTransform: 'none',
                fontSize: '0.8rem',
                opacity: 0.85,
                '&:hover': { opacity: 1 },
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              {item.label}
            </Button>
          ))}
      </div>

      {/* Spacer */}
      <div style={{ width: 8 }} />

      {/* Auth controls */}
      {!isAuthenticated ? (
        <Button
          variant="contained"
          size="small"
          onClick={() => { router.push('/app/ui/login') }}
          sx={{ textTransform: 'none' }}
        >
          Login
        </Button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography variant="body2" sx={{ opacity: 0.85, display: { xs: 'none', sm: 'block' } }}>
            {username} ({role})
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={onLogout}
            sx={{ color: 'inherit', textTransform: 'none' }}
          >
            Logout
          </Button>
        </div>
      )}
    </MuiAppBar>
  )
}
