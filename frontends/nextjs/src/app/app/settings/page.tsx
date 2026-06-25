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
import {
  Typography,
  Paper,
  Button,
  Switch,
  Divider,
  Chip,
} from '@/m3'

function SettingsContent() {
  const auth = useAuthContext()
  const { mode, setMode, resolvedMode } = useTheme()

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      {/* Theme */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Appearance</Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Typography variant="body2">Theme Mode</Typography>
            <Typography variant="caption" color="text.secondary">
              Current: {resolvedMode} (preference: {mode})
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['light', 'dark', 'system'] as const).map(m => (
              <Chip
                key={m}
                label={m}
                size="small"
                variant={mode === m ? 'filled' : 'outlined'}
                onClick={() => { setMode(m) }}
                sx={{ cursor: 'pointer', textTransform: 'capitalize' }}
              />
            ))}
          </div>
        </div>
      </Paper>

      {/* Account */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Account</Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Typography variant="body2">Username</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {auth.user?.username ?? 'N/A'}
          </Typography>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Typography variant="body2">Email</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {auth.user?.email ?? 'N/A'}
          </Typography>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">Role</Typography>
          <Chip label={auth.user?.role ?? 'user'} size="small" />
        </div>
        <Divider sx={{ my: 2 }} />
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => { void auth.logout() }}
        >
          Sign Out
        </Button>
      </Paper>

      {/* DBAL */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>DBAL Connection</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          API URL: {process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'}
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
