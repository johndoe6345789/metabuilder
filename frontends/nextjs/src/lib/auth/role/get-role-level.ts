import type { AppLevel, UserRole } from '../types/level-types'

const ROLE_LEVELS: Record<UserRole, AppLevel> = {
  public: 1,
  user: 2,
  moderator: 3,
  admin: 4,
  god: 5,
  supergod: 6,
}

/**
 * Get the numeric access level for a role.
 */
export function getRoleLevel(role: UserRole): AppLevel {
  return ROLE_LEVELS[role]
}
