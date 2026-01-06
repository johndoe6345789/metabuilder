/**
 * Fetch current session
 * 
 * Retrieves the current user based on session token from cookies or headers
 */

import type { User } from '@/lib/types/level-types'
import { getSessionByToken } from '@/lib/db/sessions/getters/get-session-by-token'
import { mapUserRecord } from '@/lib/db/users/map-user-record'
import { getAdapter } from '@/lib/db/core/dbal-client'
import { cookies } from 'next/headers'

/**
 * Fetch the current session user
 * 
 * @returns User if session is valid, null otherwise
 */
export async function fetchSession(): Promise<User | null> {
  try {
    // Get session token from cookies
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (sessionToken === undefined || sessionToken === null || sessionToken.length === 0) {
      return null
    }

    // Get session from token
    const session = await getSessionByToken(sessionToken)
    
    if (session === null || session === undefined) {
      return null
    }

    // Get user from session
    const adapter = getAdapter()
    const userRecord = await adapter.findFirst('User', {
      where: { id: session.userId },
    })

    if (userRecord === null || userRecord === undefined) {
      return null
    }

    const user = mapUserRecord(userRecord as Record<string, unknown>)
    return user
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}
