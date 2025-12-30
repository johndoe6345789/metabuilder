/**
 * Server-side session validation for API routes
 * Extracts and validates session from request cookies
 */

import { cookies } from 'next/headers'

import { AUTH_COOKIE_NAME } from '@/lib/auth/session-constants'
import { getSessionByToken } from '@/lib/db/sessions/get-session-by-token'
import { getUserById } from '@/lib/db/users/get-user-by-id'

export interface SessionUser {
  id: string
  username: string
  email: string
  level: number
  tenantId: string | null
  role?: string
}

export interface SessionResult {
  user: SessionUser | null
  error?: string
}

/**
 * Get the current session user from request cookies
 * Returns null if no valid session exists
 */
export const getSessionUser = async (): Promise<SessionResult> => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return { user: null, error: 'No session token' }
    }

    const session = await getSessionByToken(token)
    if (!session) {
      return { user: null, error: 'Invalid session' }
    }

    // Check session expiry
    if (session.expiresAt && session.expiresAt < Date.now()) {
      return { user: null, error: 'Session expired' }
    }

    const user = await getUserById(session.userId)
    if (!user) {
      return { user: null, error: 'User not found' }
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email || '',
        level: user.level,
        tenantId: user.tenantId,
        role: user.role,
      },
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return { user: null, error: 'Session validation failed' }
  }
}

/**
 * Require authenticated session - throws if not logged in
 */
export const requireSession = async (): Promise<SessionUser> => {
  const { user, error } = await getSessionUser()
  if (!user) {
    throw new Error(error || 'Authentication required')
  }
  return user
}
