/**
 * Shared type definitions for auth-related DBAL records
 *
 * These interfaces describe the shape of records returned by the
 * DBAL client (Record<string, unknown>) so we can safely access
 * properties without `unknown` type errors.
 */

/** Shape of a user record from the DBAL */
export interface DbalUserRecord {
  id: string
  username: string
  email: string
  role: string
  isInstanceOwner?: boolean
  profilePicture?: string | null
  bio?: string | null
  createdAt: number | bigint
  tenantId?: string | null
  passwordChangeTimestamp?: number | bigint | null
  firstLogin?: boolean
}

/** Shape of a session record from the DBAL */
export interface DbalSessionRecord {
  id: string
  userId: string
  token: string
  expiresAt?: number | bigint
}

/** Shape of a credential record from the DBAL */
export interface DbalCredentialRecord {
  id: string
  username: string
  passwordHash: string
  userId: string
}
