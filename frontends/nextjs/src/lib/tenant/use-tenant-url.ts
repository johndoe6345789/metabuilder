'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { normalizeTenantId, tenantPath } from '@/lib/tenant/workspace-paths'

/**
 * Move a signed-in user onto the tenant-scoped panel route they asked for.
 *
 * Signed in, the tenant belongs in the URL and chrome routes live under the
 * panel: /app/dashboard becomes /app/{tenant}/panel/dashboard.
 *
 * Does nothing while auth is still resolving, for signed-out visitors, or on
 * a path that already carries a tenant -- so the public site and the login
 * flow are untouched.
 */
export function useTenantUrl(
  tenantId: string | undefined,
  isAuthenticated: boolean,
  isLoading: boolean
): void {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading || !isAuthenticated || tenantId === undefined) return
    const tenant = normalizeTenantId(tenantId)
    if (pathname === `/${tenant}` || pathname.startsWith(`/${tenant}/`)) return
    // These are the chrome routes, so they land under the panel. A published
    // page is served bare at /{tenant}/{route} and never reaches this hook.
    router.replace(tenantPath(tenant, pathname))
  }, [tenantId, isAuthenticated, isLoading, pathname, router])
}
