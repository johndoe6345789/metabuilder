import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

export type GetUsersOptions =
  | { tenantId: string }
  | { scope: 'all' }

/**
 * Get users from database.
 * Requires explicit scope to avoid accidental cross-tenant access.
 */
export async function getUsers(options: GetUsersOptions): Promise<User[]> {
  const adapter = getAdapter()
  const listOptions = 'tenantId' in options ? { filter: { tenantId: options.tenantId } } : undefined
  const result = listOptions ? await adapter.list('User', listOptions) : await adapter.list('User')
  return (result.data as any[]).map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role as any,
    profilePicture: u.profilePicture || undefined,
    bio: u.bio || undefined,
    createdAt: Number(u.createdAt),
    tenantId: u.tenantId || undefined,
    isInstanceOwner: u.isInstanceOwner,
  }))
}
