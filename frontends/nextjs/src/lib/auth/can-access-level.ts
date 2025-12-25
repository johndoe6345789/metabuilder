import type { UserRole } from '../level-types'

/**
 * Role hierarchy mapping roles to their numeric permission levels
 */
const roleHierarchy: Record<UserRole, number> = {
  public: 1,
  user: 2,
  admin: 3,
  god: 4,
  supergod: 5,
}

/**
 * Check if a user role has access to a given permission level
 */
export function canAccessLevel(userRole: UserRole, level: number): boolean {
  return roleHierarchy[userRole] >= level
}
