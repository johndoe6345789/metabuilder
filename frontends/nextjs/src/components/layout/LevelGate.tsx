/**
 * LevelGate Component
 *
 * Protects content behind a minimum auth level.
 * Mirrors the Qt6 pattern where nav items have `level` props
 * and content is only visible when currentLevel >= requiredLevel.
 *
 * Usage:
 *   <LevelGate minLevel={4} levelName="God">
 *     <GodPanelContent />
 *   </LevelGate>
 */
'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { getRoleLevel } from '@/lib/constants'
import { Typography, Button, Paper } from '@/m3'
import { useRouter } from 'next/navigation'
import s from './LevelGate.module.scss'

export interface LevelGateProps {
  children: React.ReactNode
  /** Minimum ROLE_LEVELS value required (0=public, 1=user, 2=mod, 3=admin, 4=god, 5=supergod) */
  minLevel: number
  /** Human-readable level name for the access denied message */
  levelName?: string
  /** If true, shows nothing instead of access denied */
  silent?: boolean
}

export function LevelGate({
  children,
  minLevel,
  levelName,
  silent = false,
}: LevelGateProps) {
  const auth = useAuthContext()
  const router = useRouter()

  const userLevel =
    auth.user != null ? getRoleLevel(auth.user.role ?? 'user') : 0

  // User has sufficient level
  if (userLevel >= minLevel) {
    return <>{children}</>
  }

  // Not authenticated at all
  if (!auth.isAuthenticated) {
    if (silent) return null
    return (
      <Paper className={s.panel}>
        <Typography variant="h5" gutterBottom>
          Authentication Required
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          className={s.copyLarge}
        >
          You need to sign in to access this area.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            router.push('/login')
          }}
        >
          Sign In
        </Button>
      </Paper>
    )
  }

  // Authenticated but insufficient level
  if (silent) return null
  return (
    <Paper className={s.panel}>
      <Typography variant="h5" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" className={s.copy}>
        {levelName != null
          ? `${levelName} access (Level ${minLevel}) is required to view this page.`
          : `Level ${minLevel} access is required to view this page.`}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your current level: {userLevel} ({auth.user?.role ?? 'unknown'})
      </Typography>
    </Paper>
  )
}
