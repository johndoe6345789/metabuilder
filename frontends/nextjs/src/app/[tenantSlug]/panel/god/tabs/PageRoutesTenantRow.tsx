'use client'

import { Button, Chip } from '@/m3'
import { TenantSelect } from '@/components/tenant/TenantSelect'
import s from './PageRoutesTab.module.scss'

export interface PageRoutesTenantRowProps {
  tenant: string
  tenantInput: string
  setTenantInput: (next: string) => void
  applyTenant: (next?: string) => void
  /** Only supergod may point this tool at a tenant other than their own --
   *  see use-current-tenant-scope. Everyone else gets a locked chip. */
  canPickOtherTenant: boolean
  pageCount: number
  live: number
  draft: number
}

export function PageRoutesTenantRow({
  tenant,
  tenantInput,
  setTenantInput,
  applyTenant,
  canPickOtherTenant,
  pageCount,
  live,
  draft,
}: PageRoutesTenantRowProps) {
  return (
    <div className={s.tenantRow}>
      {canPickOtherTenant && (
        <>
          <TenantSelect
            id="page-routes-tenant"
            value={tenantInput}
            onChange={next => {
              setTenantInput(next)
              applyTenant(next)
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              applyTenant()
            }}
          >
            Load
          </Button>
        </>
      )}
      <Chip label={`/${tenant}/`} size="small" variant="outlined" />
      {pageCount > 0 && (
        <>
          <Chip label={`${live} live`} size="small" color="success" />
          {draft > 0 && <Chip label={`${draft} draft`} size="small" />}
        </>
      )}
    </div>
  )
}
