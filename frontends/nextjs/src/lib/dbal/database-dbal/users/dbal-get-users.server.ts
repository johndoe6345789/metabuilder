import 'server-only'

import type { User } from '../../types/level-types'
import { getDBAL } from '../core/get-dbal.server'

/**
 * DBAL-powered user operations
 */
export async function dbalGetUsers(): Promise<User[]> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  const result = await dbal.users.list()
  // Map DBAL User type to app User type
  return result.data.map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    profilePicture: u.profilePicture,
    bio: u.bio,
    createdAt: u.createdAt instanceof Date ? u.createdAt.getTime() : Number(u.createdAt),
    tenantId: u.tenantId,
    isInstanceOwner: u.isInstanceOwner,
  }))
}
