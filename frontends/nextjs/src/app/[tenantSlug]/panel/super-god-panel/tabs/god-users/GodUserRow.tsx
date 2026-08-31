'use client'

import { Typography, Paper, Avatar, Chip } from '@/m3'
import type { GodUser } from './use-god-users'
import s from '../GodUsersTab.module.scss'

export function GodUserRow({ user }: { user: GodUser }) {
  const isSupergod = user.role === 'supergod'

  return (
    <Paper>
      <div className={s.userRow}>
        <div className={s.userInfo}>
          <Avatar className={isSupergod ? s.avatarSupergod : s.avatarGod}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="subtitle2">{user.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </div>
        </div>
        <Chip
          label={user.role}
          size="small"
          className={isSupergod ? s.chipSupergod : s.chipGod}
        />
      </div>
    </Paper>
  )
}
