import 'server-only'

import type { User } from '../../types/level-types'
import { getDBAL } from '../core/get-dbal.server'

export async function dbalGetUserById(userId: string): Promise<User | null> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  const user = await dbal.users.get(userId)
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role as any,
    profilePicture: user.profilePicture,
    bio: user.bio,
    createdAt: user.createdAt instanceof Date ? user.createdAt.getTime() : Number(user.createdAt),
    tenantId: user.tenantId,
    isInstanceOwner: user.isInstanceOwner,
  }
}
