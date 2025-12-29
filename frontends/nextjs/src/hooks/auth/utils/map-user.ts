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
    ...user,
    level: getRoleLevel(user.role),
  }
}
