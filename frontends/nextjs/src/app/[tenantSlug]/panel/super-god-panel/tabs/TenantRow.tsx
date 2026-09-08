'use client'

import { Typography, Paper, Button } from '@/m3'
import type { Tenant } from './use-tenants'
import s from './TenantsTab.module.scss'

export interface TenantRowProps {
  tenant: Tenant
  onDelete: (id: string) => void
}

export function TenantRow({ tenant, onDelete }: TenantRowProps) {
  return (
    <Paper>
      <div className={s.tenantRow}>
        <div>
          <Typography variant="subtitle1">{tenant.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {tenant.ownerName} &middot; {tenant.members} member
            {tenant.members === 1 ? '' : 's'}
            {tenant.createdAt > 0 &&
              ` · since ${new Date(tenant.createdAt).toLocaleDateString()}`}
          </Typography>
        </div>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => {
            onDelete(tenant.id)
          }}
        >
          Delete
        </Button>
      </div>
    </Paper>
  )
}
