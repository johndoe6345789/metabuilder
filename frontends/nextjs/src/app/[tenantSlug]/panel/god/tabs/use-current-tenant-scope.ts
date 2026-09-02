'use client'

import { useParams } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { DEFAULT_TENANT_ID } from '@/lib/tenant/workspace-paths'

export interface CurrentTenantScope {
  /** The tenant a God Panel tool should default to -- and, for anyone but
   *  supergod, is locked to. */
  tenant: string
  /** Only the instance owner may point a tool at a tenant other than their
   *  own: every other 'god' is a single community's founder, not an
   *  instance-wide admin, and a free-text tenant picker let one read and
   *  write another tenant's pages/packages/credentials just by typing its
   *  name in. */
  canPickOtherTenant: boolean
}

/** Where a God Panel tool's tenant-scoped data should come from by default,
 *  and whether this viewer is allowed to point it somewhere else. */
export function useCurrentTenantScope(): CurrentTenantScope {
  const params = useParams<{ tenantSlug?: string }>()
  const { user } = useAuthContext()
  const tenant = params.tenantSlug ?? user?.tenantId ?? DEFAULT_TENANT_ID
  return { tenant, canPickOtherTenant: user?.role === 'supergod' }
}
