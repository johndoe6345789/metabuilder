'use client'

import { useParams } from 'next/navigation'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from './workspace-paths'

/**
 * The community whose page this is.
 *
 * Panel pages render under /{tenant}/panel/..., so the community is in
 * the route; the account's own tenant is the fallback for a page that is
 * not tenant-scoped. Shared, because every screen that guessed instead
 * guessed wrong in its own way: chat defaulted to the constant 'default'
 * and put every community in one set of rooms, and the stream apps read
 * and wrote a hardcoded `system`.
 */
export function useRouteTenant(): string {
  const params = useParams<{ tenantSlug?: string }>()
  const { user } = useAuthContext()
  return normalizeTenantId(params.tenantSlug ?? user?.tenantId)
}
