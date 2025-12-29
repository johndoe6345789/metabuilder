import 'server-only'

import type { User } from '../../types/level-types'
import { getDBAL } from '../core/get-dbal.server'

export async function dbalAddUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  // Map app role types to DBAL role types
  // Note: DBAL User type only has basic fields (id, username, email, role, createdAt, updatedAt)
  // Extended fields like profilePicture, bio, etc. are not in DBAL User type
  const dbalRole =
    user.role === 'public' ? 'user' : (user.role as 'user' | 'admin' | 'god' | 'supergod')

  const created = await dbal.users.create({
    username: user.username,
    email: user.email,
    role: dbalRole,
    profilePicture: user.profilePicture,
    bio: user.bio,
    tenantId: user.tenantId,
    isInstanceOwner: user.isInstanceOwner,
  })

  // Map DBAL User to app User, preserving extra fields
  return {
    id: created.id,
    username: created.username,
    email: created.email,
    role: created.role as any,
    profilePicture: created.profilePicture ?? user.profilePicture,
    bio: created.bio ?? user.bio,
    createdAt:
      created.createdAt instanceof Date ? created.createdAt.getTime() : Number(created.createdAt),
    tenantId: created.tenantId ?? user.tenantId,
    isInstanceOwner: created.isInstanceOwner ?? user.isInstanceOwner,
  }
}
