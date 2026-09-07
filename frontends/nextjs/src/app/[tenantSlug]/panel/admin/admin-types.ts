/** What the admin panel reads and counts. */

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/**
 * Entity names are PascalCase, taken from the schema's own `entity` field
 * rather than its filename -- this panel used to request `core/user`,
 * which matches no route, so every load fell through to the catch.
 */
/** A tenant's users. Registration writes them at /{tenant}/core/User, so
 *  the fixed /system/ path this used to be reached another community's
 *  rows -- or none at all. */
export const usersUrl = (tenant: string): string =>
  `${DBAL_URL}/${tenant}/core/User`
/** A tenant's profile comments, for the same reason. */
export const commentsUrl = (tenant: string): string =>
  `${DBAL_URL}/${tenant}/pastebin/ProfileComment`

export interface UserRecord {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
}

export interface EntityStat {
  label: string
  count: number
  icon: string
}

const ELEVATED = new Set(['admin', 'god'])

export function countElevated(users: UserRecord[]): number {
  return users.filter(u => ELEVATED.has(u.role)).length
}

export function buildStats(
  users: UserRecord[],
  commentCount: number
): EntityStat[] {
  return [
    { label: 'Total Users', count: users.length, icon: 'U' },
    { label: 'Total Comments', count: commentCount, icon: 'C' },
    { label: 'Admin Users', count: countElevated(users), icon: 'A' },
  ]
}

/** Case-insensitive match on either the name or the address. */
export function matchesSearch(user: UserRecord, search: string): boolean {
  const needle = search.trim().toLowerCase()
  if (needle === '') return true
  return (
    user.username.toLowerCase().includes(needle) ||
    user.email.toLowerCase().includes(needle)
  )
}
