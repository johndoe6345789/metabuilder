/** The admin panel's reads and its one destructive write. */

import { readList } from '@/lib/db/read-list'
import { commentsUrl, usersUrl, type UserRecord } from './admin-types'

const TIMEOUT_MS = 5000

async function getJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

/** Every user row, or null when the data layer cannot be reached. */
export async function fetchUsers(
  tenant: string
): Promise<UserRecord[] | null> {
  const json = await getJson(usersUrl(tenant))
  return json === null ? null : readList<UserRecord>(json)
}

/** How many comments exist, or null when that cannot be established. */
export async function fetchCommentCount(
  tenant: string
): Promise<number | null> {
  const json = await getJson(commentsUrl(tenant))
  return json === null ? null : readList<unknown>(json).length
}

/**
 * Really deletes the account.
 *
 * This used to drop the row from local state and stop there, so an admin
 * saw the user disappear while the account remained -- and came back on
 * the next reload. The write goes through the same authenticated path as
 * every other mutation.
 *
 * Scoped to a tenant because that is where the row is: registration writes
 * users at /{tenant}/core/User, so the fixed /system/ path this used to
 * carry was either a miss or, worse, somebody else's account.
 */
export async function deleteUser(
  tenant: string,
  id: string
): Promise<boolean> {
  try {
    const res = await fetch(`${usersUrl(tenant)}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}
