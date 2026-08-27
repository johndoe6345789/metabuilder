/**
 * The browser's session cookie.
 *
 * GET  — the current user for a bearer token (unchanged).
 * POST — exchange a verified bearer token for an httpOnly cookie.
 * DELETE — clear it on logout.
 *
 * Why a cookie at all, when the app already holds a bearer token in memory:
 * the browser sends a cookie with every same-origin request automatically,
 * including the ~40 places that call the DBAL proxy directly. That is what
 * lets the proxy tell a signed-in user from a guest without every one of
 * those call sites having to be found and changed.
 *
 * httpOnly so page scripts cannot read it, which is the one thing the
 * in-memory token cannot offer.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { fetchSession } from '@/lib/auth/api/fetch-session'

export const SESSION_COOKIE = 'mb_session'

function bearer(request: Request): string | null {
  const header = request.headers.get('authorization') ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const user = await fetchSession(bearer(request))
    if (user === null) return NextResponse.json({ user: null }, { status: 401 })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session route error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const token = bearer(request)
  // Verified before it is stored: a cookie the proxy trusts must never be
  // set from a token the data layer has not vouched for.
  const user = token === null ? null : await fetchSession(token)
  if (user === null) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const store = await cookies()
  store.set(SESSION_COOKIE, token as string, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(): Promise<NextResponse> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
