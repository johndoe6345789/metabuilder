'use client'

import { Typography, Paper, Button, Chip } from '@/m3'
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
            Created: {new Date(tenant.createdAt).toLocaleDateString()}
          </Typography>
          {tenant.homepageConfig != null && (
            <Chip label="Homepage Configured" size="small" color="success" />
          )}
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
