/**
 * POST /api/auth/logout
 *
 * Clears the session cookie and invalidates the session.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db-client'

export async function POST(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    // Remove session from DBAL if it exists
    if (sessionToken !== undefined && sessionToken.length > 0) {
      const sessions = await db.sessions.list({ filter: { token: sessionToken } })
      const session = sessions.data[0] as { id: string } | undefined
      if (session !== undefined) {
        await db.sessions.remove(session.id)
      }
    }

    // Clear cookie
    cookieStore.delete('session_token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout route error:', error)
    return NextResponse.json({ success: true })
  }
}
