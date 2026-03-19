/**
 * GET /api/auth/session
 *
 * Returns the current authenticated user from the session cookie.
 */

import { NextResponse } from 'next/server'
import { fetchSession } from '@/lib/auth/api/fetch-session'

export async function GET(): Promise<NextResponse> {
  try {
    const user = await fetchSession()

    if (user === null) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session route error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
