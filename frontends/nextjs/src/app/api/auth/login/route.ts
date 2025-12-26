import { NextResponse } from 'next/server'
import { getRequestIp } from '@/lib/api/get-request-ip'
import { readJson } from '@/lib/api/read-json'
import { getUserByEmail } from '@/lib/db/auth/get-user-by-email'
import { getUserByUsername } from '@/lib/db/auth/get-user-by-username'
import { createSession } from '@/lib/db/sessions/create-session'
import { DEFAULT_SESSION_TTL_MS } from '@/lib/auth/session-constants'
import { setSessionCookie } from '@/lib/auth/set-session-cookie'
import { createLoginSecurityContext } from '@/lib/security/secure-db/create-login-security-context'
import { getLoginLockoutInfo } from '@/lib/security/secure-db/get-login-lockout-info'
import { verifyCredentials } from '@/lib/security/secure-db/operations/verify-credentials'

interface LoginPayload {
  identifier?: string
  username?: string
  email?: string
  password?: string
  tenantId?: string
}

export async function POST(request: Request) {
  const body = await readJson<LoginPayload>(request)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const identifier = [body.identifier, body.username, body.email]
    .find((value) => typeof value === 'string' && value.trim().length > 0)
    ?.trim()
  const password = typeof body.password === 'string' ? body.password : ''
  const tenantId = typeof body.tenantId === 'string' && body.tenantId.trim()
    ? body.tenantId.trim()
    : undefined

  if (!identifier || !password) {
    return NextResponse.json(
      { error: 'Username/email and password are required' },
      { status: 400 }
    )
  }

  const lookupOptions = tenantId ? { tenantId } : undefined
  let user = identifier.includes('@')
    ? await getUserByEmail(identifier, lookupOptions)
    : await getUserByUsername(identifier, lookupOptions)

  if (!user) {
    user = identifier.includes('@')
      ? await getUserByUsername(identifier, lookupOptions)
      : await getUserByEmail(identifier, lookupOptions)
  }

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const securityContext = createLoginSecurityContext({
    identifier: user.username,
    tenantId,
    ipAddress: getRequestIp(request),
    requestId: request.headers.get('x-request-id') ?? undefined,
  })

  const isValid = await verifyCredentials(securityContext, user.username, password)
  if (!isValid) {
    const lockoutInfo = getLoginLockoutInfo(securityContext.user.username)
    if (lockoutInfo.locked) {
      const response = NextResponse.json(
        { error: 'Too many failed login attempts. Try again later.' },
        { status: 429 }
      )
      if (lockoutInfo.remainingMs) {
        response.headers.set('Retry-After', Math.ceil(lockoutInfo.remainingMs / 1000).toString())
      }
      return response
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const expiresAt = Date.now() + DEFAULT_SESSION_TTL_MS
  const session = await createSession({ userId: user.id, expiresAt })

  const response = NextResponse.json({ user })
  setSessionCookie(response, session.token, { maxAgeMs: DEFAULT_SESSION_TTL_MS })
  return response
}
