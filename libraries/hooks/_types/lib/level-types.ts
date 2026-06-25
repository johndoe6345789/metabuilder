/**
 * Type stub for @/lib/level-types
 * User entity type used by user management hooks.
 */

export interface User {
  id: string
  username: string
  email: string
  role: string
  level?: number
  bio?: string
  profilePicture?: string
  status?: string
  tenantId?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}
