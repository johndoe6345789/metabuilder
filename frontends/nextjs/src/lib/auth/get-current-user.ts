/**
 * Get current user from session
 * 
 * Retrieves the authenticated user from the session cookie.
 * Returns null if no session exists or session is expired.
 */

import 'server-only'
import { cookies } from 'next/headers'
import { db } from '@/lib/db-client'
import { SESSION_COOKIE, getRoleLevel } from '@/lib/constants'
import type { User } from '@/lib/types/level-types'
import type { DbalUserRecord, DbalSessionRecord } from '@/lib/auth/types'

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

    // Get session from database using DBAL
    const sessions = await db.sessions.list({
      filter: { token: sessionToken.value }
    })
    
    const session = sessions.data?.[0] as DbalSessionRecord | undefined

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (session === null || session === undefined) {
      return null
    }

    // Get user from database using DBAL
    const user = await db.users.read(session.userId) as DbalUserRecord | null
     
    if (user === null || user === undefined) {
      return null
    }

    // Add level based on role
    const level = getRoleLevel(user.role)

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isInstanceOwner: user.isInstanceOwner || false,
      profilePicture: user.profilePicture || null,
      bio: user.bio || null,
      createdAt: Number(user.createdAt),
      tenantId: user.tenantId || null,
      level,
    }
  } catch (error) {
    // Log error but don't expose details to caller
    console.error('Error getting current user:', error)
    return null
  }
}
