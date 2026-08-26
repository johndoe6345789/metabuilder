'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { Typography, Paper, Button, Chip } from '@/m3'
import s from './PowerTransferTab.module.scss'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface GodUser {
  id: string
  username: string
  email: string
  role: string
}

export function PowerTransferTab() {
  const auth = useAuthContext()
  const [allUsers, setAllUsers] = useState<GodUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/user`, { signal: AbortSignal.timeout(5000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: GodUser[] } | null) => {
        if (json?.data != null) {
          setAllUsers(
            json.data.filter(
              u => u.id !== auth.user?.id && u.role !== 'supergod'
            )
          )
        }
      })
      .catch(() => {
        /* offline */
      })
  }, [auth.user?.id])

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Transfer Super God Power
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Transfer your Super God privileges to another user. You will be
        downgraded to God.
      </Typography>

      <div className={s.warning}>
        <Typography variant="subtitle2" className={s.warningTitle}>
          Critical Action
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone. Only one Super God can exist at a time.
        </Typography>
      </div>

      <Typography variant="subtitle2" gutterBottom>
        Select User to Transfer Power To:
      </Typography>
      <div className={s.userList}>
        {allUsers.map(user => (
          <Paper
            key={user.id}
            className={`${s.userRow} ${
              selectedUserId === user.id ? s.userRowSelected : ''
            }`}
            onClick={() => {
              setSelectedUserId(user.id)
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
        ))}
        {allUsers.length === 0 && (
          <div className={s.empty}>
            <Typography variant="body2" color="text.secondary">
              No eligible users. Connect to DBAL to load users.
            </Typography>
          </div>
        )}
      </div>

      <Button
        variant="contained"
        fullWidth
        disabled={selectedUserId == null}
        className={s.transferBtn}
      >
        Initiate Power Transfer
      </Button>
    </div>
  )
}
