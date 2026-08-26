/**
 * Settings Page (Level 1+: User)
 *
 * Mirrors the Qt6 sidebar "Settings" item
 * User-facing settings: theme, notifications, account
 */
'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { useTheme } from '@/app/providers'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Paper, Button, Divider, Chip } from '@/m3'
import s from './page.module.scss'

function SettingsContent() {
  const auth = useAuthContext()
  const { mode, setMode, resolvedMode } = useTheme()

  return (
    <div className={s.root}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Theme */}
      <Paper className={s.panel}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <div className={s.row}>
          <div>
            <Typography variant="body2">Theme Mode</Typography>
            <Typography variant="caption" color="text.secondary">
              Current: {resolvedMode} (preference: {mode})
            </Typography>
          </div>
          <div className={s.chipRow}>
            {(['light', 'dark', 'system'] as const).map(m => (
              <Chip
                key={m}
                label={m}
                size="small"
                variant={mode === m ? 'filled' : 'outlined'}
                onClick={() => {
                  setMode(m)
                }}
                className={s.clickableChip}
              />
            ))}
          </div>
        </div>
      </Paper>

      {/* Account */}
      <Paper className={s.panel}>
        <Typography variant="h6" gutterBottom>
          Account
        </Typography>
        <div className={s.accountRow}>
          <Typography variant="body2">Username</Typography>
          <Typography variant="body2" className={s.value}>
            {auth.user?.username ?? 'N/A'}
          </Typography>
        </div>
        <div className={s.accountRow}>
          <Typography variant="body2">Email</Typography>
          <Typography variant="body2" className={s.value}>
            {auth.user?.email ?? 'N/A'}
          </Typography>
        </div>
        <div className={s.accountRow}>
          <Typography variant="body2">Role</Typography>
          <Chip label={auth.user?.role ?? 'user'} size="small" />
        </div>
        <Divider className={s.divider} />
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => {
            void auth.logout()
          }}
        >
          Sign Out
        </Button>
      </Paper>

      {/* DBAL */}
      <Paper className={s.panel}>
        <Typography variant="h6" gutterBottom>
          DBAL Connection
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className={s.dbalUrl}
        >
          API URL:{' '}
          {process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Data is persisted client-side via Redux + redux-persist (IndexedDB).
          Server data fetched from DBAL C++ daemon REST API.
        </Typography>
      </Paper>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <SettingsContent />
    </LevelGate>
  )
}
