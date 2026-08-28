/**
 * Levels data
 *
 * Aligned with ROLE_LEVELS in lib/constants.ts and Qt6 App.qml:
 * - Level 0: Public (guest, no auth)
 * - Level 1: User (authenticated)
 * - Level 2: Moderator
 * - Level 3: Admin
 * - Level 4: God (meta-builder access)
 * - Level 5: Super God (multi-tenant control)
 */

export const levelsData = {
  public: 0,
  user: 1,
  moderator: 2,
  admin: 3,
  god: 4,
  supergod: 5,
} as const

export const PERMISSION_LEVELS = levelsData

export type LevelName = keyof typeof levelsData
export type LevelNumber = (typeof levelsData)[LevelName]
