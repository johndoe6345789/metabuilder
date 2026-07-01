/**
 * POST /api/auth/login
 *
 * Authenticates a user and sets a session cookie.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { login } from '@/lib/auth/api/login'
import { db } from '@/lib/db-client'
import crypto from 'crypto'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as { identifier?: string; password?: string }
    const { identifier, password } = body

    if (identifier === undefined || password === undefined) {
      return NextResponse.json(
        { success: false, user: null, error: 'Identifier and password are required' },
        { status: 400 },
      )
    }

    const result = await login(identifier, password)

    if (!result.success || result.user === null) {
      return NextResponse.json(result, { status: 401 })
    }

    // Create a session token and persist it
    const sessionToken = crypto.randomUUID()
    const sessionId = crypto.randomUUID()
    await db.sessions.create({
      id: sessionId,
      userId: result.user.id ?? '',
      token: sessionToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { success: false, user: null, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
