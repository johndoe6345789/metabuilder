'use client'

import { Chip, Typography } from '@/m3'
import type { UserRow } from '../users-data'
import s from '../UsersTab.module.scss'

/** One account in the table. */
export function UserRowView({ user }: { user: UserRow }) {
  return (
    <div className={s.row}>
      <div>
        <Typography variant="body2">
          {user.username ?? 'Unknown user'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.email ?? 'No email'}
        </Typography>
      </div>
      <Chip label={user.role ?? 'user'} size="small" variant="outlined" />
      <Typography variant="body2">{user.tenantId ?? 'system'}</Typography>
      <Typography variant="body2">L{user.level ?? 1}</Typography>
    </div>
  )
}
