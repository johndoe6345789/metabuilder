import { useState } from 'react'
import { normalizeTenant } from './page-routes-logic'
import { useCurrentTenantScope } from './use-current-tenant-scope'

/** The tenant currently loaded and the pending edit in the selector's
 *  input box -- split out of use-page-routes-tab so that hook only owns
 *  page/dialog state.
 *
 *  Defaults to (and, unless the viewer is supergod, is locked to) their
 *  own current tenant -- see use-current-tenant-scope for why. */
export function usePageRoutesTenant() {
  const { tenant: currentTenant, canPickOtherTenant } = useCurrentTenantScope()
  const [override, setOverride] = useState<string | null>(null)
  const [tenantInput, setTenantInput] = useState(currentTenant)

  const tenant =
    canPickOtherTenant && override !== null ? override : currentTenant

  const applyTenant = (next?: string) => {
    if (!canPickOtherTenant) return
    setOverride(normalizeTenant(next ?? tenantInput))
  }

  return {
    tenant, tenantInput, setTenantInput, applyTenant, canPickOtherTenant,
  }
}
