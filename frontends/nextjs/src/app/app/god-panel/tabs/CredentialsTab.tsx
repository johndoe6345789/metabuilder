'use client'

import { Typography, Paper, Chip, Divider } from '@/m3'
import s from './CredentialsTab.module.scss'

const SEED_USERS = [
  'demo / demo (user, L2)',
  'admin / admin (admin, L3)',
  'god / god123 (god, L4)',
  'super / super123 (supergod, L5)',
]

export function CredentialsTab() {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Credential Management</Typography>
      <Typography variant="body2" color="text.secondary">
        JWT auth + JSON ACL configuration.
      </Typography>
      <Paper>
        <Typography variant="subtitle2" gutterBottom>
          JWT Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Auth config: DBAL_AUTH_CONFIG=/app/schemas/auth/auth.json
        </Typography>
        <Divider />
        <Typography variant="subtitle2" gutterBottom>
          Seed Users
        </Typography>
        <div className={s.chipRow}>
          {SEED_USERS.map(u => (
            <Chip key={u} label={u} size="small" variant="outlined" />
          ))}
        </div>
      </Paper>
    </div>
  )
}
