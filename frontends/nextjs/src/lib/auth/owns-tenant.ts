import 'server-only'
import { cookies } from 'next/headers'

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/lib/auth/session-cookie'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

/**
 * Whether this session may act on that community.
 *
 * Verifying a session answers "is this somebody", never "is this somebody
 * who owns what they are about to change" -- and every route that stopped
 * at the first question let one founder reach another's data.
 *
 * The rule is the one the God Panel already states for its own tenant
 * picker: your own community, unless you are the instance owner, because
 * every other 'god' is a single community's founder rather than an
 * instance-wide admin.
 */
export function ownsTenant(
  user: { role?: unknown; tenantId?: unknown },
  target: string
): boolean {
  if (user.role === 'supergod') return true
  const own =
    typeof user.tenantId === 'string' ? normalizeTenantId(user.tenantId) : ''
  // A session naming no tenant cannot be shown to own this one.
  return own !== '' && own === normalizeTenantId(target)
}

/**
 * 'anonymous' when nobody is signed in or the token no longer resolves,
 * 'forbidden' when somebody is but the community is not theirs, else 'ok'.
 *
 * Kept as one call so a route cannot check the first question and forget
 * the second -- which is exactly how every one of these ended up letting a
 * founder reach another community's data. The two answers stay apart so a
 * stale session still reads as "sign in again" rather than "not allowed".
 */
export type TenantAccess = 'ok' | 'anonymous' | 'forbidden'

export async function callerAccessTo(tenant: string): Promise<TenantAccess> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null
  if (token === null || token === '') return 'anonymous'
  const user = await fetchSession(token)
  if (user === null) return 'anonymous'
  return ownsTenant(user, tenant) ? 'ok' : 'forbidden'
}
