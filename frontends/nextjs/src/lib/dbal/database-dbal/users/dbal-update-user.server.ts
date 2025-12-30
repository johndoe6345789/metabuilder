import 'server-only'

import type { User, UserRole } from '../../types/level-types'
import { getDBAL } from '../core/get-dbal.server'

type DBALUserRecord = {
  id: string
  username: string
  email: string
  role: string
  profilePicture?: string
  bio?: string
  createdAt: number | string | Date
  tenantId?: string
  isInstanceOwner?: boolean
}

type DBALUserUpdate = Partial<
  Pick<User, 'username' | 'email' | 'role' | 'profilePicture' | 'bio' | 'tenantId' | 'isInstanceOwner'>
>

const USER_ROLES = new Set<UserRole>([
  'public',
  'user',
  'moderator',
  'admin',
  'god',
  'supergod',
])

function toUserRole(role: string): UserRole {
  return USER_ROLES.has(role as UserRole) ? (role as UserRole) : 'user'
}

export async function dbalUpdateUser(userId: string, updates: Partial<User>): Promise<User> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  // Map app updates to DBAL updates (only common fields)
  const dbalUpdates: DBALUserUpdate = {}
  if (updates.username) dbalUpdates.username = updates.username
  if (updates.email) dbalUpdates.email = updates.email
  if (updates.role) {
    dbalUpdates.role = updates.role === 'public' ? 'user' : updates.role
  }
  if (updates.profilePicture !== undefined) dbalUpdates.profilePicture = updates.profilePicture
  if (updates.bio !== undefined) dbalUpdates.bio = updates.bio
  if (updates.tenantId !== undefined) dbalUpdates.tenantId = updates.tenantId
  if (updates.isInstanceOwner !== undefined) dbalUpdates.isInstanceOwner = updates.isInstanceOwner

  const updated = (await dbal.users.update(userId, dbalUpdates)) as DBALUserRecord

  // Map DBAL User to app User, preserving extended fields from original updates
  return {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    role: toUserRole(updated.role),
    profilePicture: updated.profilePicture ?? updates.profilePicture,
    bio: updated.bio ?? updates.bio,
    createdAt:
      updated.createdAt instanceof Date ? updated.createdAt.getTime() : Number(updated.createdAt),
    tenantId: updated.tenantId ?? updates.tenantId,
    isInstanceOwner: updated.isInstanceOwner ?? updates.isInstanceOwner,
  }
}
