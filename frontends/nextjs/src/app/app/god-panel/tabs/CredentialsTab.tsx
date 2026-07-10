'use client'

import { useEffect, useState } from 'react'
import { Typography, Paper, Chip, Divider, Alert } from '@/m3'
import s from './CredentialsTab.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

const SEED_USERS = [
  { username: 'demo', role: 'user', level: 2 },
  { username: 'admin', role: 'admin', level: 3 },
  { username: 'god', role: 'god', level: 4 },
  { username: 'supergod', role: 'supergod', level: 5 },
]

function extractCount(raw: unknown): number | null {
  if (Array.isArray(raw)) return raw.length
  if (raw !== null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data.length
  }
  return null
}

export function CredentialsTab() {
  const [credentialCount, setCredentialCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/access/Credential`, {
      signal: AbortSignal.timeout(8000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then(raw => { setCredentialCount(extractCount(raw)) })
      .catch(() => { setCredentialCount(null) })
  }, [])

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>Credential Management</Typography>
      <Typography variant="body2" color="text.secondary">
        JWT auth + JSON ACL configuration.
      </Typography>
      <Alert severity="info">
        Password hashes are intentionally not displayed here. Rotate seeded
        credentials before exposing a production environment.
      </Alert>
      <Paper className={s.panel}>
        <Typography variant="subtitle2" gutterBottom>
          JWT Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Auth config: DBAL_AUTH_CONFIG=/app/schemas/auth/auth.json
        </Typography>
        {credentialCount !== null && (
          <Chip
            label={`${credentialCount} credential records`}
            size="small"
            className={s.countChip}
          />
        )}
        <Divider />
        <Typography variant="subtitle2" gutterBottom>
          Seeded Identities
        </Typography>
        <div className={s.chipRow}>
          {SEED_USERS.map(user => (
            <Chip
              key={user.username}
              label={`${user.username} · ${user.role} · L${user.level}`}
              size="small"
              variant="outlined"
            />
          ))}
        </div>
      </Paper>
    </div>
  )
}
