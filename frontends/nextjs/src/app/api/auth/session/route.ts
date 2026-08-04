/**
 * GET /api/auth/session
 *
 * Returns the current authenticated user for a DBAL OIDC access token,
 * passed via `Authorization: Bearer <token>`.
 */

import { NextResponse } from 'next/server'
import { fetchSession } from '@/lib/auth/api/fetch-session'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const user = await fetchSession(token)

    if (user === null) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session route error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
