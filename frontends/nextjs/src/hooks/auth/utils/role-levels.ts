/**
 * @file role-levels.ts
 * @description Role level mappings for authorization
 */

export const roleLevels: Record<string, number> = {
  public: 1,
  user: 2,
  moderator: 3,
  admin: 4,
  god: 5,
  supergod: 6,
}

/**
 * Get the numeric level for a role
 */
export const getRoleLevel = (role: string): number => {
  return roleLevels[role] ?? 0
}
