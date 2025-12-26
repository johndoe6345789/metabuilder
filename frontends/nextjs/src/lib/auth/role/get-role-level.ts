import type { AppLevel, UserRole } from '../types/level-types'

const ROLE_LEVELS: Record<UserRole, AppLevel> = {
  public: 1,
  user: 2,
  admin: 3,
  god: 4,
  supergod: 5,
}

/**
 * Get the numeric access level for a role.
 */
export function getRoleLevel(role: UserRole): AppLevel {
  return ROLE_LEVELS[role]
}
