/**
 * Get current user from a DBAL OIDC bearer token
 *
 * Verifies the token via DBAL's /oidc/userinfo and loads the full profile
 * from the DBAL User entity. Returns null if no token is supplied or it's
 * invalid/expired.
 */

import 'server-only'
import { getRoleLevel } from '@/lib/constants'
import { fetchSession } from '@/lib/auth/api/fetch-session'

export interface CurrentUser {
  id: string
  username: string
  email: string
  role: string
  isInstanceOwner: boolean
  profilePicture: string | null
  bio: string | null
  createdAt: number
  tenantId: string | null
  level: number
}

/**
 * Get the current authenticated user from a bearer token
 *
 * @param token - DBAL OIDC access token, typically from the request's
 *   `Authorization: Bearer <token>` header
 * @returns User object with level, or null if not authenticated
 */
export async function getCurrentUser(token: string | null): Promise<CurrentUser | null> {
  try {
    const user = await fetchSession(token)
    if (user == null) {
      return null
    }

    return {
      ...user,
      level: getRoleLevel(user.role),
    }
  } catch (error) {
    // Log error but don't expose details to caller
    console.error('Error getting current user:', error)
    return null
  }
}
