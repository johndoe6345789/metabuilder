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
  const { tenants, create, remove, unreachable } = useTenants(auth.user?.id)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div>
      <div className={s.header}>
        <div>
          <Typography variant="h6">Tenant Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Every community on this instance, and who founded it. A
            community starts existing when someone signs up for it.
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

      {unreachable ? (
        <Paper className={s.placeholder}>
          {/* An empty list and an unreadable one look identical, and this
              is the only view of what exists on the instance. */}
          <Typography variant="body2" role="alert">
            Could not read the accounts on this instance, so this list is
            empty because nothing answered — not because nothing is here.
          </Typography>
        </Paper>
      ) : tenants.length === 0 ? (
        <Paper className={s.placeholder}>
          <Typography variant="body2" color="text.secondary">
            No communities yet. One starts existing when someone signs up.
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
