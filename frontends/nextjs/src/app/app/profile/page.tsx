/**
 * Profile Page (Level 1+: User)
 *
 * Mirrors old/src/components/Level2.tsx profile tab
 * User can view and edit their profile information
 */
'use client'

import { useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import {
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Divider,
} from '@/m3'
import { getRoleLevel } from '@/lib/constants'
import { getLevelColor } from '@/lib/packages/navigation'

function ProfileContent() {
  const auth = useAuthContext()
  const user = auth.user
  const userLevel = getRoleLevel(user?.role ?? 'user')
  const levelColor = getLevelColor(userLevel)

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  const handleSave = () => {
    // In production, this would call the DBAL API to update the user
    setEditing(false)
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <Typography variant="h6">Profile Information</Typography>
          {!editing ? (
            <Button variant="outlined" size="small" onClick={() => { setEditing(true) }}>
              Edit Profile
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outlined" size="small" onClick={() => { setEditing(false) }}>
                Cancel
              </Button>
              <Button variant="contained" size="small" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: levelColor, fontSize: '2rem' }}>
            {(user?.username ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="h6">{user?.username}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {user?.role} Account
            </Typography>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            onChange={(e) => { setEmail(e.target.value) }}
            disabled={!editing}
            fullWidth
            size="small"
          />
          <TextField
            label="Bio"
            value={editing ? bio : (user?.bio ?? '')}
            onChange={(e) => { setBio(e.target.value) }}
            disabled={!editing}
            fullWidth
            multiline
            rows={4}
            size="small"
            placeholder="Tell us about yourself..."
          />
          <TextField
            label="Account Created"
            value="--"
            disabled
            fullWidth
            size="small"
          />
        </div>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" gutterBottom>
          Security
        </Typography>
        <Button variant="outlined" size="small">
          Request New Password via Email
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
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
