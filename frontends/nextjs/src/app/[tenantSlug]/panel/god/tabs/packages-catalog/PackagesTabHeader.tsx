'use client'

import { Button, Typography } from '@/m3'
import { TenantSelect } from '@/components/tenant/TenantSelect'
import s from '../PackagesTab.module.scss'

export interface PackagesTabHeaderProps {
  tenantInput: string
  onTenantInputChange: (value: string) => void
  onLoad: () => void
}

export function PackagesTabHeader(props: PackagesTabHeaderProps) {
  return (
    <div className={s.header}>
      <Typography variant="h6">Packages</Typography>
      <Typography variant="body2" color="text.secondary">
        Install features for a tenant. Each package adds pages and
        navigation instantly.
      </Typography>
      <div className={s.tenantRow}>
        <TenantSelect
          id="packages-tenant"
          value={props.tenantInput}
          onChange={props.onTenantInputChange}
        />
        <Button variant="outlined" size="small" onClick={props.onLoad}>
          Load
        </Button>
      </div>
    </div>
  )
}
