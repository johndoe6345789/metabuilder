'use client'

import { useParams } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/**
 * Whose chat this is.
 *
 * The page renders under /{tenant}/panel/chat, so the community is in the
 * route. The hook used to be called with no tenant at all and defaulted
 * to the constant 'default', which put every community that ever signed
 * in on this browser into one shared set of rooms.
 */
export function useChatTenant(): string {
  const params = useParams<{ tenantSlug?: string }>()
  const { user } = useAuthContext()
  return normalizeTenantId(params.tenantSlug ?? user?.tenantId)
}
