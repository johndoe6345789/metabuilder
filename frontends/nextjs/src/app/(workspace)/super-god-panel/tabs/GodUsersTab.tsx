'use client'

import { useState, useEffect } from 'react'
import { Typography, Paper, Avatar, Chip } from '@/m3'
import s from './GodUsersTab.module.scss'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface GodUser {
  id: string
  username: string
  email: string
  role: string
}

export function GodUsersTab() {
  const [godUsers, setGodUsers] = useState<GodUser[]>([])

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/user`, { signal: AbortSignal.timeout(5000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: GodUser[] } | null) => {
        if (json?.data != null) {
          setGodUsers(
            json.data.filter(u => u.role === 'god' || u.role === 'supergod')
          )
        }
      })
      .catch(() => {
        setGodUsers([
          {
            id: '1',
            username: 'god',
            email: 'god@metabuilder.dev',
            role: 'god',
          },
          {
            id: '2',
            username: 'super',
            email: 'super@metabuilder.dev',
            role: 'supergod',
          },
        ])
      })
  }, [])

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
          <Paper key={user.id}>
            <div className={s.userRow}>
              <div className={s.userInfo}>
                <Avatar
                  className={
                    user.role === 'supergod' ? s.avatarSupergod : s.avatarGod
                  }
                >
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
                className={
                  user.role === 'supergod' ? s.chipSupergod : s.chipGod
                }
              />
            </div>
          </Paper>
        ))}
      </div>
    </div>
  )
}
