/**
 * Get current user from session
 * 
 * Retrieves the authenticated user from the session cookie.
 * Returns null if no session exists or session is expired.
 */

import 'server-only'
import { cookies } from 'next/headers'
import { getSessionByToken } from '@/lib/db/sessions'
import { SESSION_COOKIE, getRoleLevel } from '@/lib/constants'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { mapUserRecord } from '@/lib/db/users/map-user-record'
import type { User } from '@/lib/types/level-types'

export interface CurrentUser extends User {
  level: number
}

/**
 * Get the current authenticated user from session
 * 
 * @returns User object with level, or null if not authenticated
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE)

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (sessionToken?.value === null || sessionToken?.value === undefined || sessionToken.value.length === 0) {
      return null
    }

    // Get session from database
    const session = await getSessionByToken(sessionToken.value)
    
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (session === null || session === undefined) {
      return null
    }

    // Get user from database
    const adapter = getAdapter()
    const userResult = await adapter.get('User', session.userId)

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
     
    if (userResult.data === null || userResult.data === undefined) {
      return null
    }

    // Map to User type and add level
    const user = mapUserRecord(userResult.data as Record<string, unknown>)
    const level = getRoleLevel(user.role)

    return {
      ...user,
      level,
    }
  } catch (error) {
    // Log error but don't expose details to caller
    console.error('Error getting current user:', error)
    return null
  }
}
