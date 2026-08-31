'use client'

import { Typography } from '@/m3'
import { useGodUsers } from './god-users/use-god-users'
import { GodUserRow } from './god-users/GodUserRow'
import s from './GodUsersTab.module.scss'

export function GodUsersTab() {
  const godUsers = useGodUsers()

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        God-Level Users
      </Typography>
      <Typography variant="body2" color="text.secondary">
        All users with God access level
      </Typography>
      <div className={s.list}>
        {godUsers.map(user => (
          <GodUserRow key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}
