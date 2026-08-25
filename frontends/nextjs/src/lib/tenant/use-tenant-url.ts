'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/**
 * Move a signed-in user onto the tenant-scoped twin of the route they are on.
 *
 * Signed in, the tenant belongs in the URL: /app/dashboard becomes
 * /app/{tenant}/dashboard. Every workspace route has a twin under
 * [tenantSlug]/(workspace), so this is a rewrite of the first segment, not a
 * different page.
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
    router.replace(`/${tenant}${pathname}`)
  }, [tenantId, isAuthenticated, isLoading, pathname, router])
}
