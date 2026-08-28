/**
 * Setting a Credential's password, on behalf of a signed-in god.
 *
 * The browser cannot do this itself. Credential is `schema.acl.system`, so
 * it is unreachable through DBAL's generic entity CRUD, and the one
 * supported write path -- POST /admin/credentials -- is gated on
 * DBAL_ADMIN_TOKEN, an operator secret that must never reach the client.
 *
 * So this route is the bridge: it authenticates the caller as a god the
 * normal way (session cookie -> DBAL OIDC), and only then attaches the
 * admin token server-side. The token stays in the server environment; the
 * browser sends a plaintext password over the same origin and DBAL hashes
 * it with Argon2id, which is the only form verify_password accepts.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { STATUS } from '@/lib/routing'
import { requireRole } from '@/lib/routing/require-role'
import { ROLE_LEVELS } from '@/lib/constants'
import { applyRateLimit } from '@/lib/middleware/rate-limit'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  'http://localhost:8080'

/** DBAL's own limits, checked here so a bad request never leaves the app. */
const MIN_USERNAME = 3
const MAX_USERNAME = 50
const MIN_PASSWORD = 8
const MAX_PASSWORD = 128
const USERNAME = /^[A-Za-z0-9_-]+$/

interface SetCredentialBody {
  username?: unknown
  password?: unknown
  tenantId?: unknown
}

function reject(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status })
}

function readBody(raw: unknown): { username: string; password: string } | null {
  if (raw === null || typeof raw !== 'object') return null
  const { username, password } = raw as SetCredentialBody
  if (typeof username !== 'string' || typeof password !== 'string') return null
  return { username, password }
}

function validate(username: string, password: string): string | null {
  if (username.length < MIN_USERNAME || username.length > MAX_USERNAME) {
    return `Username must be ${MIN_USERNAME}-${MAX_USERNAME} characters.`
  }
  if (!USERNAME.test(username)) {
    return 'Username may contain only letters, numbers, underscore and hyphen.'
  }
  if (password.length < MIN_PASSWORD || password.length > MAX_PASSWORD) {
    return `Password must be ${MIN_PASSWORD}-${MAX_PASSWORD} characters.`
  }
  if (password.trim().length === 0) {
    return 'Password must not be entirely whitespace.'
  }
  return null
}

export async function POST(request: NextRequest): Promise<Response> {
  const limited = applyRateLimit(request, 'mutation')
  if (limited != null) return limited

  const check = await requireRole(request, 'god')
  if (!check.ok) return check.response
  const { actor } = check

  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    return reject('Invalid JSON body', STATUS.BAD_REQUEST)
  }

  const body = readBody(parsed)
  if (body === null) {
    return reject('username and password are required', STATUS.BAD_REQUEST)
  }

  const invalid = validate(body.username, body.password)
  if (invalid !== null) return reject(invalid, STATUS.BAD_REQUEST)

  // A god may only provision inside its own tenant; a supergod anywhere.
  const requested = (parsed as SetCredentialBody).tenantId
  const wanted =
    typeof requested === 'string' ? requested : actor.tenantId
  if (actor.level < ROLE_LEVELS.supergod && wanted !== actor.tenantId) {
    return reject(
      'God users can only manage credentials inside their own tenant.',
      STATUS.FORBIDDEN
    )
  }

  const adminToken = process.env.DBAL_ADMIN_TOKEN ?? ''
  if (adminToken.length === 0) {
    return reject(
      'Credential management is not configured on this deployment.',
      STATUS.ERROR
    )
  }

  try {
    const res = await fetch(`${DBAL_URL}/admin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      // DBAL hashes this with Argon2id. Never hash it here: a client- or
      // app-side digest is not a form verify_password can check.
      body: JSON.stringify({
        username: body.username,
        password: body.password,
        tenantId: wanted,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      // DBAL's message can name the field at fault; the token is never in it.
      const detail = await res.text().catch(() => '')
      console.error('[admin/credentials] DBAL refused:', res.status, detail)
      return reject('DBAL refused the credential write.', STATUS.BAD_REQUEST)
    }

    return NextResponse.json({ success: true, username: body.username })
  } catch (error) {
    console.error('[admin/credentials] request failed:', error)
    return reject('Credential service unavailable.', STATUS.ERROR)
  }
}
