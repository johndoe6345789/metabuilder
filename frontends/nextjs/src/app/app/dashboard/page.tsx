/**
 * Dashboard Page (Level 1+: User)
 *
 * Mirrors old/src/components/Level2.tsx user dashboard
 * Shows user-specific content: profile summary, recent activity, quick actions
 */
'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import {
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  Divider,
} from '@/m3'
import { getRoleLevel } from '@/lib/constants'
import { getLevelLabel, getLevelColor } from '@/lib/packages/navigation'
import Link from 'next/link'

function DashboardContent() {
  const auth = useAuthContext()
  const user = auth.user
  const userLevel = getRoleLevel(user?.role ?? 'user')
  const levelColor = getLevelColor(userLevel)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user?.username ?? user?.name ?? 'User'}
      </Typography>

      {/* Profile summary card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: levelColor, fontSize: '1.5rem' }}>
            {(user?.username ?? 'U').charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="h6">{user?.username ?? user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Chip
                label={`Level ${userLevel} - ${getLevelLabel(userLevel)}`}
                size="small"
                sx={{ bgcolor: levelColor, color: '#fff' }}
              />
              <Chip label={user?.role ?? 'user'} size="small" variant="outlined" />
            </div>
          </div>
        </div>
        {user?.bio != null && user.bio !== '' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {user.bio}
            </Typography>
          </>
        )}
      </Paper>

      {/* Quick actions */}
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" gutterBottom>Profile</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Edit your profile information
          </Typography>
          <Button component={Link} href="/app/profile" variant="outlined" size="small">
            Edit Profile
          </Button>
        </Paper>

        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" gutterBottom>Comments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            View community discussion
          </Typography>
          <Button component={Link} href="/app/comments" variant="outlined" size="small">
            View Comments
          </Button>
        </Paper>

        {userLevel >= 2 && (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>Admin Panel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Manage users and data
            </Typography>
            <Button component={Link} href="/app/admin" variant="outlined" size="small">
              Admin Panel
            </Button>
          </Paper>
        )}

        {userLevel >= 4 && (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>God Panel</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Application builder tools
            </Typography>
            <Button component={Link} href="/app/god-panel" variant="outlined" size="small">
              God Panel
            </Button>
          </Paper>
        )}
      </div>

      {/* Five levels overview (from Level1.tsx) */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Five Levels of Power
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { level: 1, name: 'Public Website', desc: 'Landing pages, public content', color: '#2196f3' },
          { level: 2, name: 'User Area', desc: 'Profiles, comments, chat', color: '#4caf50' },
          { level: 3, name: 'Admin Panel', desc: 'CRUD, user management', color: '#ff9800' },
          { level: 4, name: 'God Builder', desc: 'Schemas, workflows, Lua', color: '#9c27b0' },
          { level: 5, name: 'Super God', desc: 'Multi-tenant control', color: '#ffc107' },
        ].map(item => (
          <Paper
            key={item.level}
            sx={{
              p: 2,
              borderLeft: `4px solid ${item.color}`,
              opacity: userLevel >= item.level ? 1 : 0.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: item.color, fontSize: '0.75rem' }}>
                {item.level}
              </Avatar>
              <Typography variant="subtitle2">{item.name}</Typography>
            </div>
            <Typography variant="caption" color="text.secondary">
              {item.desc}
            </Typography>
            {userLevel >= item.level && (
              <Chip label="Unlocked" size="small" sx={{ mt: 1, bgcolor: item.color, color: '#fff', height: 20, fontSize: '0.65rem' }} />
            )}
          </Paper>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <DashboardContent />
    </LevelGate>
  )
}
