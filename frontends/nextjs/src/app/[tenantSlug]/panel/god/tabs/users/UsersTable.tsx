'use client'

import { Paper, Typography } from '@/m3'
import type { UserRole } from '@/lib/constants'
import type { UserRow } from '../users-data'
import { UserRowView } from './UserRowView'
import s from '../UsersTab.module.scss'

export interface UsersTableProps {
  users: UserRow[]
  loading: boolean
  caller: { id?: string; role?: string }
  onRoleChange: (user: UserRow, role: UserRole) => void
}

/** The header row plus one row per user, or a loading/empty message. */
export function UsersTable({
  users,
  loading,
  caller,
  onRoleChange,
}: UsersTableProps) {
  return (
    <Paper className={s.table}>
      <div className={s.headerRow}>
        <span>User</span>
        <span>Role</span>
        <span>Tenant</span>
        <span>Level</span>
      </div>
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading users…
        </Typography>
      ) : users.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No users match the current filter.
        </Typography>
      ) : (
        users.map(user => (
          <UserRowView
            key={user.id ?? user.username}
            user={user}
            caller={caller}
            onRoleChange={onRoleChange}
          />
        ))
      )}
    </Paper>
  )
}
