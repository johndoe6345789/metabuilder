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

type DBALUserRole = Exclude<UserRole, 'public'>

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

export async function dbalAddUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  // Map app role types to DBAL role types
  // Note: DBAL User type only has basic fields (id, username, email, role, createdAt, updatedAt)
  // Extended fields like profilePicture, bio, etc. are not in DBAL User type
  const dbalRole: DBALUserRole = user.role === 'public' ? 'user' : user.role

  const created = (await dbal.users.create({
    username: user.username,
    email: user.email,
    role: dbalRole,
    profilePicture: user.profilePicture,
    bio: user.bio,
    tenantId: user.tenantId,
    isInstanceOwner: user.isInstanceOwner,
  })) as DBALUserRecord

  // Map DBAL User to app User, preserving extra fields
  return {
    id: created.id,
    username: created.username,
    email: created.email,
    role: toUserRole(created.role),
    profilePicture: created.profilePicture ?? user.profilePicture,
    bio: created.bio ?? user.bio,
    createdAt:
      created.createdAt instanceof Date ? created.createdAt.getTime() : Number(created.createdAt),
    tenantId: created.tenantId ?? user.tenantId,
    isInstanceOwner: created.isInstanceOwner ?? user.isInstanceOwner,
  }
}
