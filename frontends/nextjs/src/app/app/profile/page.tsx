'use client'

import { useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Paper, Button, TextField, Avatar, Divider } from '@/m3'
import { getRoleLevel } from '@/lib/constants'
import { getLevelColor } from '@/lib/packages/navigation'
import s from './page.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

function ProfileContent() {
  const auth = useAuthContext()
  const user = auth.user
  const levelColor = getLevelColor(getRoleLevel(user?.role ?? 'user'))

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = () => {
    if (user?.id == null) return
    fetch(`${DBAL_URL}/v1/default/core/user/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, bio }),
    })
      .then(res => {
        setStatus(res.ok ? 'success' : 'error')
        if (res.ok) setEditing(false)
      })
      .catch(() => { setStatus('error') })
  }

  return (
    <div className={s.root}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Paper>
        <div className={s.cardHeader}>
          <Typography variant="h6">Profile Information</Typography>
          {!editing ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => { setEditing(true) }}
            >
              Edit Profile
            </Button>
          ) : (
            <div className={s.editButtons}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => { setEditing(false) }}
              >
                Cancel
              </Button>
              <Button variant="contained" size="small" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </div>

        {status !== 'idle' && (
          <div
            className={`${s.statusMsg} ${
              status === 'success' ? s.statusSuccess : s.statusError
            }`}
          >
            {status === 'success'
              ? 'Profile saved successfully.'
              : 'Failed to save profile. Please try again.'}
          </div>
        )}

        <div className={s.avatarRow}>
          <Avatar style={{ backgroundColor: levelColor }}>
            {(user?.username ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="h6">{user?.username}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role} Account
            </Typography>
          </div>
        </div>

        <div className={s.fields}>
          <TextField
            label="Username"
            value={user?.username ?? ''}
            disabled
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            type="email"
            value={editing ? email : (user?.email ?? '')}
            onChange={e => { setEmail(e.target.value) }}
            disabled={!editing}
            fullWidth
            size="small"
          />
          <TextField
            label="Bio"
            value={editing ? bio : (user?.bio ?? '')}
            onChange={e => { setBio(e.target.value) }}
            disabled={!editing}
            fullWidth
            multiline
            rows={4}
            size="small"
            placeholder="Tell us about yourself..."
          />
        </div>

        <Divider />
        <Typography variant="subtitle2" gutterBottom>Security</Typography>
        <Button variant="outlined" size="small">
          Request New Password via Email
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          className={s.captionBlock}
        >
          A new randomly generated password will be sent to your email address
        </Typography>
      </Paper>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <ProfileContent />
    </LevelGate>
  )
}
