/**
 * POST /api/auth/register
 *
 * Creates a new user account and sets a session cookie.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { register } from '@/lib/auth/api/register'
import { db } from '@/lib/db-client'
import crypto from 'crypto'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      username?: string
      email?: string
      password?: string
    }
    const { username, email, password } = body

    if (username === undefined || email === undefined || password === undefined) {
      return NextResponse.json(
        { success: false, user: null, error: 'Username, email, and password are required' },
        { status: 400 },
      )
    }

    const result = await register(username, email, password)

    if (!result.success || result.user === null) {
      return NextResponse.json(result, { status: 400 })
    }

    // Create a session token and persist it
    const sessionToken = crypto.randomUUID()
    await db.sessions.create({
      id: `sess_${sessionToken}`,
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
    console.error('Register route error:', error)
    return NextResponse.json(
      { success: false, user: null, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
