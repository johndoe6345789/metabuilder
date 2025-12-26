import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { readJson } from '@/lib/api/read-json'
import { addUser } from '@/lib/db/users/add-user'
import { getUserByEmail } from '@/lib/db/users/get-user-by-email'
import { getUserByUsername } from '@/lib/db/users/get-user-by-username'
import { hashPassword } from '@/lib/db/hash-password'
import { setCredential } from '@/lib/db/credentials/set-credential'
import { createSession } from '@/lib/db/sessions/create-session'
import { DEFAULT_SESSION_TTL_MS } from '@/lib/auth/session-constants'
import { setSessionCookie } from '@/lib/auth/set-session-cookie'
import type { UserRole } from '@/lib/level-types'

interface RegisterPayload {
  username?: string
  email?: string
  password?: string
  tenantId?: string
  profilePicture?: string
  bio?: string
}

const DEFAULT_ROLE: UserRole = 'user'

export async function POST(request: Request) {
  const body = await readJson<RegisterPayload>(request)

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const tenantId = typeof body.tenantId === 'string' && body.tenantId.trim()
    ? body.tenantId.trim()
    : undefined

  if (!username || !email || !password) {
    return NextResponse.json(
      { error: 'Username, email, and password are required' },
      { status: 400 }
    )
  }

  const lookupOptions = tenantId ? { tenantId } : undefined
  const [existingByUsername, existingByEmail] = await Promise.all([
    getUserByUsername(username, lookupOptions),
    getUserByEmail(email, lookupOptions),
  ])

  if (existingByUsername || existingByEmail) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 409 }
    )
  }

  const user = {
    id: randomUUID(),
    username,
    email,
    role: DEFAULT_ROLE,
    profilePicture: body.profilePicture,
    bio: body.bio,
    createdAt: Date.now(),
    tenantId,
    isInstanceOwner: false,
  }

  await addUser(user)

  const passwordHash = await hashPassword(password)
  await setCredential(username, passwordHash)

  const expiresAt = Date.now() + DEFAULT_SESSION_TTL_MS
  const session = await createSession({ userId: user.id, expiresAt })

  const response = NextResponse.json({ user }, { status: 201 })
  setSessionCookie(response, session.token, { maxAgeMs: DEFAULT_SESSION_TTL_MS })
  return response
}
