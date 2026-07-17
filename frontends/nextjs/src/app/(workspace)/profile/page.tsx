'use client'

import { useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Button, TextField, Avatar } from '@/m3'
import { getRoleLevel } from '@/lib/constants'
import { getLevelColor } from '@/lib/packages/navigation'
import s from './page.module.scss'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

function ProfileContent() {
  const auth = useAuthContext()
  const user = auth.user
  const role = user?.role ?? 'user'
  const roleLevel = getRoleLevel(role)
  const levelColor = getLevelColor(roleLevel)
  const username = user?.username ?? 'User'
  const emailAddress = user?.email ?? ''
  const initial = username.charAt(0).toUpperCase()
  const joined =
    user?.createdAt != null
      ? new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(user.createdAt))
      : 'Not recorded'

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio ?? '')
  const [email, setEmail] = useState(emailAddress)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [securityStatus, setSecurityStatus] = useState<'idle' | 'queued'>(
    'idle'
  )

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
      .catch(() => {
        setStatus('error')
      })
  }

  const handleCancel = () => {
    setEmail(emailAddress)
    setBio(user?.bio ?? '')
    setStatus('idle')
    setEditing(false)
  }

  const handlePasswordRequest = () => {
    setSecurityStatus('queued')
  }

  return (
    <div className={s.root}>
      <header className={s.hero}>
        <div className={s.identity}>
          <Avatar className={s.avatar} style={{ backgroundColor: levelColor }}>
            {initial}
          </Avatar>
          <div className={s.heroCopy}>
            <div className={s.kicker}>Profile</div>
            <Typography variant="h4" className={s.title}>
              {username}
            </Typography>
            <div className={s.metaRow}>
              <span
                className={s.levelPill}
                style={{ borderColor: levelColor, color: levelColor }}
              >
                Level {roleLevel}
              </span>
              <span>{role} account</span>
              <span>{emailAddress || 'No email on file'}</span>
            </div>
          </div>
        </div>

        <div className={s.heroActions}>
          {!editing ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setEditing(true)
                setStatus('idle')
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outlined" size="small" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" size="small" onClick={handleSave}>
                Save changes
              </Button>
            </>
          )}
        </div>
      </header>

      <section className={s.statsGrid} aria-label="Profile summary">
        <div className={s.stat}>
          <span className="material-symbols-rounded">verified_user</span>
          <div>
            <strong>{roleLevel}</strong>
            <p>Access level</p>
          </div>
        </div>
        <div className={s.stat}>
          <span className="material-symbols-rounded">event</span>
          <div>
            <strong>{joined}</strong>
            <p>Joined</p>
          </div>
        </div>
        <div className={s.stat}>
          <span className="material-symbols-rounded">badge</span>
          <div>
            <strong>{role}</strong>
            <p>Role</p>
          </div>
        </div>
      </section>

      <div className={s.grid}>
        <section className={s.panel}>
          <div className={s.cardHeader}>
            <div>
              <Typography variant="h6">Profile information</Typography>
              <p>Keep the public details crisp and recognizable.</p>
            </div>
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

          <div className={s.fields}>
            <TextField
              label="Username"
              value={username}
              disabled
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={editing ? email : (user?.email ?? '')}
              onChange={e => {
                setEmail(e.target.value)
              }}
              disabled={!editing}
              fullWidth
              size="small"
            />
            <TextField
              label="Bio"
              value={editing ? bio : (user?.bio ?? '')}
              onChange={e => {
                setBio(e.target.value)
              }}
              disabled={!editing}
              fullWidth
              multiline
              rows={4}
              size="small"
              placeholder="Tell us about yourself..."
            />
          </div>
        </section>

        <aside className={s.panel}>
          <div className={s.cardHeader}>
            <div>
              <Typography variant="h6">Security</Typography>
              <p>Password recovery and account contact checks.</p>
            </div>
          </div>
          <div className={s.securityCard}>
            <span className="material-symbols-rounded">mail_lock</span>
            <div>
              <strong>Password reset email</strong>
              <p>
                A new randomly generated password will be sent to your email
                address.
              </p>
            </div>
          </div>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePasswordRequest}
            fullWidth
          >
            Request new password
          </Button>
          {securityStatus === 'queued' && (
            <div className={`${s.statusMsg} ${s.statusSuccess}`}>
              Password reset request queued for {emailAddress || 'this account'}
              .
            </div>
          )}
        </aside>
      </div>
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
