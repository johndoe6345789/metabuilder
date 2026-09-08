/** Who may give which role to whom, and the write that does it. */

import { getRoleLevel, ROLE_LEVELS, type UserRole } from '@/lib/constants'
import type { UserRow } from './users-data'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/** The roles an account can be given, lowest first. `public` is not one:
 *  an account that exists is at least a user. */
const GRANTABLE: readonly UserRole[] = [
  'user',
  'moderator',
  'admin',
  'god',
  'supergod',
]

/** An unset role is a user -- the schema's default. */
export function userLevel(user: Pick<UserRow, 'role'>): number {
  return getRoleLevel(user.role ?? 'user')
}

/** The roles the caller may hand out: every one strictly below their own.
 *  A founder (god) can make moderators and admins; only the instance owner
 *  can make a god; nobody can make a peer. */
export function assignableRoles(callerRole: string | undefined): UserRole[] {
  const ceiling = getRoleLevel(callerRole ?? 'public')
  return GRANTABLE.filter(role => ROLE_LEVELS[role] < ceiling)
}

/** Whether the caller may change this account's role at all: not their
 *  own, not anyone at or above their level, and only a row with an id. */
export function mayChangeRole(
  caller: { id?: string; role?: string },
  user: UserRow
): boolean {
  if (user.id === undefined || user.id === caller.id) return false
  return userLevel(user) < getRoleLevel(caller.role ?? 'public')
}

/**
 * Writes the new role. Goes through the authenticated path like every
 * other mutation, to the tenant's own User row -- registration writes
 * users at /{tenant}/core/User, never under /system/.
 */
export async function updateUserRole(
  tenant: string,
  id: string,
  role: UserRole
): Promise<void> {
  const res = await fetch(`${DBAL_URL}/${tenant}/core/User/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}
