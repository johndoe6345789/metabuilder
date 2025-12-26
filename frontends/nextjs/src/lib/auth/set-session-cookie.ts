import type { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, DEFAULT_SESSION_TTL_MS } from './session-constants'

export function setSessionCookie(
  response: NextResponse,
  token: string,
  options?: { maxAgeMs?: number }
): void {
  const maxAgeMs = options?.maxAgeMs ?? DEFAULT_SESSION_TTL_MS
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  })
}
