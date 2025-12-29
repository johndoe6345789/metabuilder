import { getRoleLevel } from '../role/get-role-level'
import type { UserRole } from '../types/level-types'

/**
 * Check if a user role has access to a given permission level
 */
export function canAccessLevel(userRole: UserRole, level: number): boolean {
  return getRoleLevel(userRole) >= level
}
