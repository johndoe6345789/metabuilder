import { useState } from 'react'
import { normalizeTenant } from './page-routes-logic'
import { useCurrentTenantScope } from './use-current-tenant-scope'

/**
 * The tenant a God Panel tool is pointed at, and the pending edit in its
 * selector.
 *
 * Defaults to -- and, unless the viewer is the instance owner, is locked
 * to -- their own community; see use-current-tenant-scope for why a
 * free-text picker without that guard let one founder read and write
 * another's data by typing its name.
 *
 * Shared rather than copied: the Packages tab grew its own version that
 * started at 'system' and had no guard at all, which is how a founder came
 * to install packages into the shared tenant while being told their pages
 * were live.
 */
export function useTenantPicker() {
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
