'use client'

import { Typography, Paper, Chip } from '@/m3'
import type { GodUser } from './use-power-transfer-users'
import s from './PowerTransferTab.module.scss'

export interface PowerTransferUserRowProps {
  user: GodUser
  selected: boolean
  onSelect: (id: string) => void
}

export function PowerTransferUserRow({
  user,
  selected,
  onSelect,
}: PowerTransferUserRowProps) {
  return (
    <Paper
      className={`${s.userRow} ${selected ? s.userRowSelected : ''}`}
      onClick={() => {
        onSelect(user.id)
      }}
    >
      <div>
        <Typography variant="subtitle2">{user.username}</Typography>
        <Typography variant="caption" color="text.secondary">
          {user.email}
        </Typography>
      </div>
      <Chip label={user.role} size="small" variant="outlined" />
    </Paper>
  )
}
