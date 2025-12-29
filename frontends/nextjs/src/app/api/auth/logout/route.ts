import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { clearSessionCookie } from '@/lib/auth/clear-session-cookie'
import { AUTH_COOKIE_NAME } from '@/lib/auth/session-constants'
import { deleteSessionByToken } from '@/lib/db/sessions/delete-session-by-token'

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (token) {
    await deleteSessionByToken(token)
  }

  const response = NextResponse.json({ success: true })
  clearSessionCookie(response)
  return response
}
