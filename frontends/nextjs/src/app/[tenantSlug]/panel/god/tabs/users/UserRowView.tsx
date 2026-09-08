'use client'

import { Typography } from '@/m3'
import type { UserRole } from '@/lib/constants'
import type { UserRow } from '../users-data'
import { userLevel } from '../users-roles'
import { RoleCell } from './RoleCell'
import s from '../UsersTab.module.scss'

export interface UserRowViewProps {
  user: UserRow
  caller: { id?: string; role?: string }
  onRoleChange: (user: UserRow, role: UserRole) => void
}

/** One account in the table. */
export function UserRowView({ user, caller, onRoleChange }: UserRowViewProps) {
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
      <RoleCell user={user} caller={caller} onChange={onRoleChange} />
      <Typography variant="body2">{user.tenantId ?? 'system'}</Typography>
      {/* The level follows from the role -- the row carries no level of
          its own, and reading one off it showed every god as L1. */}
      <Typography variant="body2">L{userLevel(user)}</Typography>
    </div>
  )
}
