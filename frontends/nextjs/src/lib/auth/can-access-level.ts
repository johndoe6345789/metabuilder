import type { UserRole } from '../types/level-types'
import { getRoleLevel } from './get-role-level'

/**
 * Check if a user role has access to a given permission level
 */
export function canAccessLevel(userRole: UserRole, level: number): boolean {
  return getRoleLevel(userRole) >= level
}
