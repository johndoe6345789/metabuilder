/**
 * Shared constants for the application
 * 
 * Centralizes magic strings and values used across the codebase.
 */

/**
 * User role levels mapping
 * Used for permission checks throughout the application
 */
export const ROLE_LEVELS = {
  public: 0,
  user: 1,
  moderator: 2,
  admin: 3,
  god: 4,
  supergod: 5,
} as const

export type UserRole = keyof typeof ROLE_LEVELS
export type UserLevel = typeof ROLE_LEVELS[UserRole]

/**
 * Get numeric level for a role string
 */
export function getRoleLevel(role: string): number {
  if (role in ROLE_LEVELS) {
    return ROLE_LEVELS[role as UserRole]
  }
  return 0
}

/**
 * Check if a role has at least the specified level
 */
export function hasMinLevel(role: string, minLevel: number): boolean {
  return getRoleLevel(role) >= minLevel
}

/**
 * Environment configuration defaults
 * Note: DBAL adapter and DATABASE_URL are configured in the C++ daemon via env vars.
 * The frontend only needs the DBAL API URL to make REST calls — adapter is backend-only.
 */
export const ENV_DEFAULTS = {
  /** Default page size for DBAL queries */
  DEV_PAGE_SIZE: 50,
} as const

/**
 * HTTP status codes
 * Re-exported from routing for convenience
 */
export { STATUS } from '@/lib/routing'

/**
 * Session cookie name
 */
export const SESSION_COOKIE = 'session_token'

/**
 * Default timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  /** Session expiry time */
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  /** API request timeout */
  API_TIMEOUT: 30 * 1000, // 30 seconds
  /** DBAL daemon timeout */
  DBAL_TIMEOUT: 10 * 1000, // 10 seconds
} as const
