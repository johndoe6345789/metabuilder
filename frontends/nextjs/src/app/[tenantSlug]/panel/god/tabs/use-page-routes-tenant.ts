import { useState } from 'react'
import { normalizeTenant, SYSTEM_TENANT } from './page-routes-logic'

/** The tenant currently loaded and the pending edit in the selector's
 *  input box -- split out of use-page-routes-tab so that hook only owns
 *  page/dialog state. */
export function usePageRoutesTenant() {
  const [tenant, setTenant] = useState(SYSTEM_TENANT)
  const [tenantInput, setTenantInput] = useState(SYSTEM_TENANT)

  const applyTenant = (next?: string) => {
    setTenant(normalizeTenant(next ?? tenantInput))
  }

  return { tenant, tenantInput, setTenantInput, applyTenant }
}
