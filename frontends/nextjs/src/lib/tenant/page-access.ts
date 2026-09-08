import 'server-only'
import { cookies } from 'next/headers'

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/lib/auth/session-cookie'
import { getRoleLevel } from '@/lib/constants'
import type { TenantPage } from './fetch-tenant-page'
import { requiredPageLevel } from './page-levels'

/**
 * Whether the visitor may see this published page.
 *
 * A founder marks a page Public, User, Moderator, Admin, God or SuperGod --
 * two pickers offer it and the row stores it as `level`, alongside
 * `requiresAuth` and `requiredRole`. The client renderer honours that
 * through LevelGate. The server-rendered routes fetched all three fields
 * and rendered the tree without reading any of them, so a page marked
 * "Admin only" was served in full to whoever had the URL -- and, being
 * server-rendered, was crawlable.
 *
 * The level itself comes from `requiredPageLevel`, which the route list
 * shares so what it shows is what this enforces.
 */
export async function mayViewPage(page: TenantPage): Promise<boolean> {
  const required = requiredPageLevel(page)
  // A public page is the common case and must not cost a session lookup on
  // every view -- nor offer a timing signal about who is asking.
  if (required <= 0) return true

  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null
    // No cookie is a signed-out visitor: there is nothing to verify, and
    // asking anyway would only add a round trip.
    if (token === null || token === '') return false

    const user = await fetchSession(token)
    if (user === null) return false

    const role = typeof user.role === 'string' ? user.role : 'public'
    return getRoleLevel(role) >= required
  } catch {
    // This is the only thing standing in front of a private page, so it
    // fails closed. An outage hides a members page; failing open publishes
    // it, and nothing downstream would notice.
    return false
  }
}
