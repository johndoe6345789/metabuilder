'use client'

import { useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { Typography, Paper, Button } from '@/m3'
import { useTenants } from './use-tenants'
import { CreateTenantForm } from './CreateTenantForm'
import { TenantRow } from './TenantRow'
import s from './TenantsTab.module.scss'

export function TenantsTab() {
  const auth = useAuthContext()
  const { tenants, create, remove } = useTenants(auth.user?.id)
  const [showCreate, setShowCreate] = useState(false)

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
          onClick={() => {
            setShowCreate(true)
          }}
        >
          Create Tenant
        </Button>
      </div>

      {showCreate && (
        <CreateTenantForm
          onCreate={name => {
            create(name)
            setShowCreate(false)
          }}
          onCancel={() => {
            setShowCreate(false)
          }}
        />
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
            <TenantRow key={tenant.id} tenant={tenant} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
