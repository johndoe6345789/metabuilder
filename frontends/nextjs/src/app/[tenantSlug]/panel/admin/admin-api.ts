/** The admin panel's reads and its one destructive write. */

import { readList } from '@/lib/db/read-list'
import { COMMENTS_URL, USERS_URL, type UserRecord } from './admin-types'

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
export async function fetchUsers(): Promise<UserRecord[] | null> {
  const json = await getJson(USERS_URL)
  return json === null ? null : readList<UserRecord>(json)
}

/** How many comments exist, or null when that cannot be established. */
export async function fetchCommentCount(): Promise<number | null> {
  const json = await getJson(COMMENTS_URL)
  return json === null ? null : readList<unknown>(json).length
}

/**
 * Really deletes the account.
 *
 * This used to drop the row from local state and stop there, so an admin
 * saw the user disappear while the account remained -- and came back on
 * the next reload. The write goes through the same authenticated path as
 * every other mutation.
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${USERS_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}
