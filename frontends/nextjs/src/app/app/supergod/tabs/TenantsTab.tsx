'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { Typography, Paper, Button, TextField, Chip } from '@/m3'
import s from './TenantsTab.module.scss'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

interface Tenant {
  id: string
  name: string
  ownerId: string
  createdAt: number
  homepageConfig?: { pageId: string }
}

export function TenantsTab() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [newTenantName, setNewTenantName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const auth = useAuthContext()

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/tenant`, {
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: Tenant[] } | null) => {
        if (json?.data != null) setTenants(json.data)
      })
      .catch(() => { /* offline */ })
  }, [])

  const handleCreate = () => {
    if (newTenantName.trim() === '') return
    setTenants(prev => [
      ...prev,
      {
        id: `tenant_${Date.now()}`,
        name: newTenantName,
        ownerId: auth.user?.id ?? 'unknown',
        createdAt: Date.now(),
      },
    ])
    setNewTenantName('')
    setShowCreate(false)
  }

  return (
    <div>
      <div className={s.header}>
        <div>
          <Typography variant="h6">Tenant Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage tenants with custom homepages
          </Typography>
        </div>
        <Button
          variant="contained"
          size="small"
          onClick={() => { setShowCreate(true) }}
        >
          Create Tenant
        </Button>
      </div>

      {showCreate && (
        <Paper>
          <Typography variant="subtitle2" gutterBottom>
            Create New Tenant
          </Typography>
          <div className={s.createRow}>
            <TextField
              label="Tenant Name"
              value={newTenantName}
              onChange={e => { setNewTenantName(e.target.value) }}
              size="small"
              fullWidth
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => { setShowCreate(false) }}
            >
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={handleCreate}>
              Create
            </Button>
          </div>
        </Paper>
      )}

      {tenants.length === 0 ? (
        <Paper className={s.placeholder}>
          <Typography variant="body2" color="text.secondary">
            No tenants created yet. Every query filters by tenantId.
          </Typography>
        </Paper>
      ) : (
        <div className={s.list}>
          {tenants.map(tenant => (
            <Paper key={tenant.id}>
              <div className={s.tenantRow}>
                <div>
                  <Typography variant="subtitle1">{tenant.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(tenant.createdAt).toLocaleDateString()}
                  </Typography>
                  {tenant.homepageConfig != null && (
                    <Chip
                      label="Homepage Configured"
                      size="small"
                      color="success"
                    />
                  )}
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => {
                    setTenants(prev => prev.filter(t => t.id !== tenant.id))
                  }}
                >
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
