import 'server-only'

import type { User } from '../../types/level-types'
import { getDBAL } from '../core/get-dbal.server'

export async function dbalUpdateUser(userId: string, updates: Partial<User>): Promise<User> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  // Map app updates to DBAL updates (only common fields)
  const dbalUpdates: any = {}
  if (updates.username) dbalUpdates.username = updates.username
  if (updates.email) dbalUpdates.email = updates.email
  if (updates.role) {
    dbalUpdates.role = updates.role === 'public' ? 'user' : updates.role
  }
  if (updates.profilePicture !== undefined) dbalUpdates.profilePicture = updates.profilePicture
  if (updates.bio !== undefined) dbalUpdates.bio = updates.bio
  if (updates.tenantId !== undefined) dbalUpdates.tenantId = updates.tenantId
  if (updates.isInstanceOwner !== undefined) dbalUpdates.isInstanceOwner = updates.isInstanceOwner

  const updated = await dbal.users.update(userId, dbalUpdates)

  // Map DBAL User to app User, preserving extended fields from original updates
  return {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    role: updated.role as any,
    profilePicture: updated.profilePicture ?? updates.profilePicture,
    bio: updated.bio ?? updates.bio,
    createdAt:
      updated.createdAt instanceof Date ? updated.createdAt.getTime() : Number(updated.createdAt),
    tenantId: updated.tenantId ?? updates.tenantId,
    isInstanceOwner: updated.isInstanceOwner ?? updates.isInstanceOwner,
  }
}
