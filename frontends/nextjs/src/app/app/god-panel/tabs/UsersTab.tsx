'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Typography, Paper, Button, Chip, TextField, Alert } from '@/m3'
import { BASE_PATH } from '@/lib/app-config'
import s from './UsersTab.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface UserRow {
  id?: string
  username?: string
  email?: string
  role?: string
  level?: number
  tenantId?: string
}

function extractUsers(raw: unknown): UserRow[] {
  if (Array.isArray(raw)) return raw as UserRow[]
  if (raw !== null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as UserRow[]
    if (
      obj.success === true &&
      obj.data !== null &&
      typeof obj.data === 'object' &&
      Array.isArray((obj.data as Record<string, unknown>).data)
    ) {
      return (obj.data as Record<string, unknown>).data as UserRow[]
    }
  }
  return []
}

export function UsersTab() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/User`, {
      signal: AbortSignal.timeout(8000),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<unknown>
      })
      .then(raw => {
        setUsers(extractUsers(raw))
        setError(null)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load users')
      })
      .finally(() => { setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (needle.length === 0) return users
    return users.filter(user =>
      [user.username, user.email, user.role, user.tenantId]
        .some(value => value?.toLowerCase().includes(needle) === true),
    )
  }, [query, users])

  const roleCounts = useMemo(() => {
    return users.reduce<Record<string, number>>((acc, user) => {
      const role = user.role ?? 'user'
      acc[role] = (acc[role] ?? 0) + 1
      return acc
    }, {})
  }, [users])

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>User Management</Typography>
      <Typography variant="body2" color="text.secondary">
        Role hierarchy: user → moderator → admin → god → supergod
      </Typography>

      <div className={s.toolbar}>
        <TextField
          label="Search users"
          size="small"
          value={query}
          onChange={e => { setQuery(e.target.value) }}
        />
        <Button
          variant="outlined"
          onClick={() => { router.push(`${BASE_PATH}/app/admin`) }}
        >
          Open Admin Panel
        </Button>
      </div>

      {error !== null && (
        <Alert severity="warning">
          User API unavailable: {error}
        </Alert>
      )}

      <div className={s.summary}>
        {Object.entries(roleCounts).map(([role, count]) => (
          <Chip key={role} label={`${role}: ${count}`} size="small" />
        ))}
      </div>

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
        ) : filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No users match the current filter.
          </Typography>
        ) : (
          filtered.map(user => (
            <div key={user.id ?? user.username} className={s.row}>
              <div>
                <Typography variant="body2">
                  {user.username ?? 'Unknown user'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email ?? 'No email'}
                </Typography>
              </div>
              <Chip
                label={user.role ?? 'user'}
                size="small"
                variant="outlined"
              />
              <Typography variant="body2">
                {user.tenantId ?? 'system'}
              </Typography>
              <Typography variant="body2">
                L{user.level ?? 1}
              </Typography>
            </div>
          ))
        )}
      </Paper>
    </div>
  )
}
