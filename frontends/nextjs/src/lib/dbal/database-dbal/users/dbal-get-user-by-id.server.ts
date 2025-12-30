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

export async function dbalGetUserById(userId: string): Promise<User | null> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  const user = (await dbal.users.get(userId)) as DBALUserRecord | null
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: toUserRole(user.role),
    profilePicture: user.profilePicture,
    bio: user.bio,
    createdAt: user.createdAt instanceof Date ? user.createdAt.getTime() : Number(user.createdAt),
    tenantId: user.tenantId,
    isInstanceOwner: user.isInstanceOwner,
  }
}
