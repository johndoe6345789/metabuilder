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

/**
 * DBAL-powered user operations
 */
export async function dbalGetUsers(): Promise<User[]> {
  const dbal = await getDBAL()
  if (!dbal) {
    throw new Error('DBAL not available')
  }

  const result = (await dbal.users.list()) as { data: DBALUserRecord[] }
  // Map DBAL User type to app User type
  return result.data.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: toUserRole(u.role),
    profilePicture: u.profilePicture,
    bio: u.bio,
    createdAt: u.createdAt instanceof Date ? u.createdAt.getTime() : Number(u.createdAt),
    tenantId: u.tenantId,
    isInstanceOwner: u.isInstanceOwner,
  }))
}
