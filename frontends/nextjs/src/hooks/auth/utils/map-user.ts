/**
 * @file map-user.ts
 * @description Map User type to AuthUser type
 */

import type { User } from '@/lib/level-types'

import type { AuthUser } from '../auth-types'
import { getRoleLevel } from './role-levels'

/**
 * Map a User object to an AuthUser object with level
 */
export const mapUserToAuthUser = (user: User): AuthUser => {
  return {
    id: user.id ?? '',
    email: user.email ?? '',
    username: user.username,
    role: user.role as AuthUser['role'],
    level: getRoleLevel(user.role ?? 'public'),
    tenantId: (user.tenantId !== null && user.tenantId !== undefined && user.tenantId.length > 0) ? user.tenantId : undefined,
    profilePicture: user.profilePicture ?? undefined,
    bio: user.bio ?? undefined,
    isInstanceOwner: user.isInstanceOwner,
  }
}
