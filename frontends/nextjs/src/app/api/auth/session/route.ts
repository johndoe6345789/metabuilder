import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, DEFAULT_SESSION_TTL_MS } from '@/lib/auth/session-constants'
import { clearSessionCookie } from '@/lib/auth/clear-session-cookie'
import { setSessionCookie } from '@/lib/auth/set-session-cookie'
import { getSessionByToken } from '@/lib/db/sessions/get-session-by-token'
import { updateSession } from '@/lib/db/sessions/update-session'
import { deleteSession } from '@/lib/db/sessions/delete-session'
import { getUserById } from '@/lib/db/users/get-user-by-id'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ user: null })
  }

  const session = await getSessionByToken(token)
  if (!session) {
    const response = NextResponse.json({ user: null })
    clearSessionCookie(response)
    return response
  }

  const user = await getUserById(session.userId)
  if (!user) {
    await deleteSession(session.id)
    const response = NextResponse.json({ user: null })
    clearSessionCookie(response)
    return response
  }

  const now = Date.now()
  const refreshedExpiry = now + DEFAULT_SESSION_TTL_MS

  await updateSession(session.id, {
    lastActivity: now,
    expiresAt: refreshedExpiry,
  })

  const response = NextResponse.json({ user })
  setSessionCookie(response, session.token, { maxAgeMs: DEFAULT_SESSION_TTL_MS })
  return response
}
