import type { UserRole } from '../types/level-types'

/**
 * Human-readable display names for user roles
 */
const roleDisplayNames: Record<UserRole, string> = {
  public: 'Public',
  user: 'User',
  admin: 'Administrator',
  god: 'System Architect',
  supergod: 'Supreme Administrator',
}

/**
 * Get the display name for a user role
 */
export function getRoleDisplayName(role: UserRole): string {
  return roleDisplayNames[role]
}
