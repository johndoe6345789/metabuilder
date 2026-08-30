'use client'

import { useParams } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { getRoleLevel } from '@/lib/constants'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/** The viewer's level, name, role and tenant, derived from auth + the URL. */
export function useShellIdentity() {
  const auth = useAuthContext()
  const params = useParams<{ tenantSlug?: string }>()

  return {
    auth,
    userLevel: auth.user != null ? getRoleLevel(auth.user.role ?? 'user') : 0,
    username: auth.user?.username ?? auth.user?.name ?? 'User',
    role: auth.user?.role ?? 'public',
    tenantId: normalizeTenantId(params.tenantSlug ?? auth.user?.tenantId),
  }
}
