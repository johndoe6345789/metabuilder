/**
 * Super God Panel Page (Level 5: SuperGod)
 *
 * Mirrors old/src/components/Level5.tsx
 * Multi-tenant control center:
 * - Tenant management (create, delete, assign homepages)
 * - God-level user overview
 * - Power transfer mechanism
 * - Level preview
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import {
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Chip,
  Tabs,
  Tab,
  TabPanel,
  Divider,
} from '@/fakemui'

const DBAL_URL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080')
  : 'http://localhost:8080'

interface Tenant {
  id: string
  name: string
  ownerId: string
  createdAt: number
  homepageConfig?: { pageId: string }
}

interface GodUser {
  id: string
  username: string
  email: string
  role: string
}

function TenantsTab() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [newTenantName, setNewTenantName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const auth = useAuthContext()

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/tenant`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: Tenant[] } | null) => {
        if (json?.data != null) setTenants(json.data)
      })
      .catch(() => { /* offline - empty tenants */ })
  }, [])

  const handleCreate = () => {
    if (newTenantName.trim() === '') return
    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: newTenantName,
      ownerId: auth.user?.id ?? 'unknown',
      createdAt: Date.now(),
    }
    setTenants(prev => [...prev, newTenant])
    setNewTenantName('')
    setShowCreate(false)
  }

  const handleDelete = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Typography variant="h6">Tenant Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage tenants with custom homepages
          </Typography>
        </div>
        <Button variant="contained" size="small" onClick={() => { setShowCreate(true) }}>
          Create Tenant
        </Button>
      </div>

      {showCreate && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Create New Tenant</Typography>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <TextField
              label="Tenant Name"
              value={newTenantName}
              onChange={(e) => { setNewTenantName(e.target.value) }}
              size="small"
              fullWidth
            />
            <Button variant="outlined" size="small" onClick={() => { setShowCreate(false) }}>
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={handleCreate}>
              Create
            </Button>
          </div>
        </Paper>
      )}

      {tenants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No tenants created yet. Every query must filter by tenantId (multi-tenant by default).
          </Typography>
        </Paper>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tenants.map(tenant => (
            <Paper key={tenant.id} sx={{ p: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{tenant.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(tenant.createdAt).toLocaleDateString()}
                  </Typography>
                  {tenant.homepageConfig != null && (
                    <Chip label="Homepage Configured" size="small" color="success" sx={{ ml: 1 }} />
                  )}
                </div>
                <Button variant="outlined" size="small" color="error" onClick={() => { handleDelete(tenant.id) }}>
                  Delete
                </Button>
              </div>
            </Paper>
          ))}
        </div>
      )}
    </div>
  )
}

function GodUsersTab() {
  const [godUsers, setGodUsers] = useState<GodUser[]>([])

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/user`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: GodUser[] } | null) => {
        if (json?.data != null) {
          setGodUsers(json.data.filter(u => u.role === 'god' || u.role === 'supergod'))
        }
      })
      .catch(() => {
        setGodUsers([
          { id: '1', username: 'god', email: 'god@metabuilder.dev', role: 'god' },
          { id: '2', username: 'super', email: 'super@metabuilder.dev', role: 'supergod' },
        ])
      })
  }, [])

  return (
    <div>
      <Typography variant="h6" gutterBottom>God-Level Users</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        All users with God access level
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {godUsers.map(user => (
          <Paper key={user.id} sx={{ p: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar sx={{ bgcolor: user.role === 'supergod' ? '#ffc107' : '#9c27b0' }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="subtitle2">{user.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </div>
              </div>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  bgcolor: user.role === 'supergod' ? '#ffc107' : '#9c27b0',
                  color: '#fff',
                }}
              />
            </div>
          </Paper>
        ))}
      </div>
    </div>
  )
}

function PowerTransferTab() {
  const auth = useAuthContext()
  const [allUsers, setAllUsers] = useState<GodUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/user`, { signal: AbortSignal.timeout(5000) })
      .then(res => res.ok ? res.json() : null)
      .then((json: { data?: GodUser[] } | null) => {
        if (json?.data != null) {
          setAllUsers(json.data.filter(u => u.id !== auth.user?.id && u.role !== 'supergod'))
        }
      })
      .catch(() => { /* offline */ })
  }, [auth.user?.id])

  return (
    <div>
      <Typography variant="h6" gutterBottom>Transfer Super God Power</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Transfer your Super God privileges to another user. You will be downgraded to God.
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'rgba(255,152,0,0.08)',
          border: '1px solid rgba(255,152,0,0.3)',
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#e65100', mb: 0.5 }}>
          Critical Action
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This action cannot be undone. Only one Super God can exist at a time.
          After transfer, you will have God-level access only.
        </Typography>
      </Paper>

      <Typography variant="subtitle2" gutterBottom>Select User to Transfer Power To:</Typography>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflow: 'auto', marginBottom: 16 }}>
        {allUsers.map(user => (
          <Paper
            key={user.id}
            sx={{
              p: 2,
              cursor: 'pointer',
              border: selectedUserId === user.id ? '2px solid #9c27b0' : '1px solid transparent',
              bgcolor: selectedUserId === user.id ? 'rgba(156,39,176,0.05)' : 'inherit',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => { setSelectedUserId(user.id) }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="subtitle2">{user.username}</Typography>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </div>
              <Chip label={user.role} size="small" variant="outlined" />
            </div>
          </Paper>
        ))}
        {allUsers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No eligible users found. Connect to DBAL to load users.
          </Typography>
        )}
      </div>

      <Button
        variant="contained"
        fullWidth
        disabled={selectedUserId == null}
        sx={{
          background: 'linear-gradient(135deg, #e65100, #ffc107)',
          '&:hover': { background: 'linear-gradient(135deg, #bf360c, #f9a825)' },
        }}
      >
        Initiate Power Transfer
      </Button>
    </div>
  )
}

function PreviewLevelsTab() {
  const router = useRouter()

  const levels = [
    { level: 1, name: 'Public', desc: 'Landing page and public content', path: '/' },
    { level: 2, name: 'User Area', desc: 'User dashboard and profile', path: '/app/dashboard' },
    { level: 3, name: 'Admin Panel', desc: 'Data management interface', path: '/app/admin' },
    { level: 4, name: 'God Panel', desc: 'System builder interface', path: '/app/god-panel' },
  ]

  return (
    <div>
      <Typography variant="h6" gutterBottom>Preview Application Levels</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        View how each level appears to different user roles
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {levels.map(item => (
          <Paper
            key={item.level}
            sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => { router.push(item.path) }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Level {item.level}: {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.desc}
            </Typography>
            <Button variant="outlined" size="small" fullWidth>
              Preview
            </Button>
          </Paper>
        ))}
      </div>
    </div>
  )
}

function SuperGodContent() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      {/* Header with gradient styling (mirrors Level5.tsx dark theme) */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(74,20,140,0.15), rgba(26,35,126,0.15))',
          border: '1px solid rgba(255,193,7,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar sx={{ bgcolor: '#ffc107', width: 48, height: 48 }}>
            <span style={{ fontSize: '1.5rem' }}>&#9813;</span>
          </Avatar>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Super God Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Multi-Tenant Control Center
            </Typography>
          </div>
        </div>
      </Paper>

      <Tabs
        value={activeTab}
        onChange={(_e, v) => { setActiveTab(v as number) }}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="Tenants" sx={{ textTransform: 'none' }} />
        <Tab label="God Users" sx={{ textTransform: 'none' }} />
        <Tab label="Power Transfer" sx={{ textTransform: 'none' }} />
        <Tab label="Preview Levels" sx={{ textTransform: 'none' }} />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <TenantsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <GodUsersTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <PowerTransferTab />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <PreviewLevelsTab />
      </TabPanel>
    </div>
  )
}

export default function SuperGodPage() {
  return (
    <LevelGate minLevel={5} levelName="Super God">
      <SuperGodContent />
    </LevelGate>
  )
}
