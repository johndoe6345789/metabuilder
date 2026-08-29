'use client'

import { Button, Chip, TableCell, TableRow } from '@/m3'
import type { UserRecord } from './admin-types'
import { roleColor } from './role-chip'
import s from './page.module.scss'

export interface UserRowProps {
  user: UserRecord
  onDelete: (user: UserRecord) => void
}

/** One account, with the control that removes it. */
export function UserRow({ user, onDelete }: UserRowProps) {
  return (
    <TableRow>
      <TableCell className={s.userName}>{user.username}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Chip label={user.role} size="small" color={roleColor(user.role)} />
      </TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        <Button
          variant="text"
          size="small"
          color="error"
          onClick={() => {
            onDelete(user)
          }}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}
