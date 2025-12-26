import type { UserRole } from '../types/level-types'
import { getLevelPath } from '../navigation/get-level-path'
import { getRoleLevel } from './get-role-level'

/**
 * Resolve the default landing route for a user role.
 */
export function getRoleHomePath(role: UserRole): string {
  return getLevelPath(getRoleLevel(role))
}
