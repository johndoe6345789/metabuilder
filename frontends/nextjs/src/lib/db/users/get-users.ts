import { getAdapter } from '../dbal-client'
import type { User } from '../../types/level-types'

/**
 * Get all users from database
 */
export async function getUsers(options?: { tenantId?: string }): Promise<User[]> {
  const adapter = getAdapter()
  const listOptions = options?.tenantId ? { filter: { tenantId: options.tenantId } } : undefined
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
