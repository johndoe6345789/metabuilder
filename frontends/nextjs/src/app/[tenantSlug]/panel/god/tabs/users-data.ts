/** Reading, filtering and summarising the user list. */

import { readList } from '@/lib/db/read-list'

export interface UserRow {
  id?: string
  username?: string
  email?: string
  role?: string
  level?: number
  tenantId?: string
}

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/**
 * Fetches every user.
 *
 * Throws with the HTTP status on a refusal, and lets a fetch failure
 * propagate as-is -- the caller reports both as one "could not load"
 * message, but the distinction is preserved for whoever reads the error.
 */
export async function fetchUsers(): Promise<UserRow[]> {
  const res = await fetch(`${DBAL_URL}/system/core/User`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return readList<UserRow>(await res.json())
}

/** Users whose username, email, role or tenant contains the search text. */
export function filterUsers(users: UserRow[], query: string): UserRow[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return users
  return users.filter(user =>
    [user.username, user.email, user.role, user.tenantId].some(
      value => value?.toLowerCase().includes(needle) === true
    )
  )
}

/** How many users hold each role, defaulting an unset role to 'user'. */
export function countByRole(users: UserRow[]): Record<string, number> {
  return users.reduce<Record<string, number>>((acc, user) => {
    const role = user.role ?? 'user'
    acc[role] = (acc[role] ?? 0) + 1
    return acc
  }, {})
}
