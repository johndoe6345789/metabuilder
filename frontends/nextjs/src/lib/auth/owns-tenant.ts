import 'server-only'
import { cookies } from 'next/headers'

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/lib/auth/session-cookie'
import { ownsTenant } from './tenant-rule'

export { ownsTenant }

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
