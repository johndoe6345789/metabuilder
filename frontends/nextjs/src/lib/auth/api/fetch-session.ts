/**
 * Fetch current session
 * 
 * Retrieves the current user based on session token from cookies
 */

import type { User } from '@/lib/types/level-types'
import type { DbalUserRecord, DbalSessionRecord } from '@/lib/auth/types'
import { db } from '@/lib/db-client'
import { cookies } from 'next/headers'

/**
 * Fetch the current session user
 * 
 * @returns User if session is valid, null otherwise
 */
export async function fetchSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken || sessionToken.length === 0) {
      return null
    }

    // Get session from token using DBAL
    const sessions = await db.sessions.list({
      filter: { token: sessionToken }
    })
    
    const session = sessions.data?.[0] as DbalSessionRecord | undefined

    if (!session) {
      return null
    }

    // Get user from session using DBAL
    const user = await db.users.read(session.userId) as DbalUserRecord | null

    if (!user) {
      return null
    }

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
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}
