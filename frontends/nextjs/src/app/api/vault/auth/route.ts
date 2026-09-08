import { type NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/middleware'
import {
  createVaultSessionToken,
  getExpectedVaultSessionToken,
  safeTokenEqual,
  VAULT_COOKIE_NAME,
} from '../vault-session'

function buildAuthResponse(authenticated: boolean): NextResponse {
  return NextResponse.json({ authenticated })
}

export function GET(request: NextRequest): NextResponse {
  const expected = getExpectedVaultSessionToken()
  if (expected === null) {
    return NextResponse.json(
      { error: 'Vault master password is not configured' },
      { status: 500 }
    )
  }
  const current = request.cookies.get(VAULT_COOKIE_NAME)?.value ?? ''
  return buildAuthResponse(safeTokenEqual(current, expected))
}

export async function POST(request: NextRequest): Promise<Response> {
  // This compares a guess against the one instance-wide master password,
  // and nothing throttled it: the whole vault was brute-forceable from a
  // loop. RATE_LIMIT_CONFIGS.login (5/min) existed for exactly this and was
  // applied to nothing, since sign-in itself is DBAL's own form.
  const limited = applyRateLimit(request, 'login')
  if (limited !== null) return limited

  const expected = getExpectedVaultSessionToken()
  if (expected === null) {
    return NextResponse.json(
      { error: 'Vault master password is not configured' },
      { status: 500 }
    )
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string
  } | null
  const password = body?.password ?? ''
  if (password.length === 0) {
    return NextResponse.json(
      { authenticated: false, error: 'Password is required' },
      { status: 400 }
    )
  }

  if (!safeTokenEqual(createVaultSessionToken(password), expected)) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid master password' },
      { status: 401 }
    )
  }

  const response = buildAuthResponse(true)
  response.cookies.set(VAULT_COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/app',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}

export function DELETE(): NextResponse {
  const response = buildAuthResponse(false)
  response.cookies.set(VAULT_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/app',
    maxAge: 0,
  })
  return response
}
