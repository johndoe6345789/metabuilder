import { NextRequest, NextResponse } from 'next/server'
import {
  createVaultSessionToken,
  getExpectedVaultSessionToken,
  VAULT_COOKIE_NAME,
} from '../vault-session'

function buildAuthResponse(authenticated: boolean): NextResponse {
  return NextResponse.json({ authenticated })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const expected = getExpectedVaultSessionToken()
  if (expected === null) {
    return NextResponse.json({ error: 'Vault master password is not configured' }, { status: 500 })
  }
  const current = request.cookies.get(VAULT_COOKIE_NAME)?.value ?? ''
  return buildAuthResponse(current === expected)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const expected = getExpectedVaultSessionToken()
  if (expected === null) {
    return NextResponse.json({ error: 'Vault master password is not configured' }, { status: 500 })
  }

  const body = await request.json().catch(() => null) as { password?: string } | null
  const password = body?.password ?? ''
  if (password.length === 0) {
    return NextResponse.json({ authenticated: false, error: 'Password is required' }, { status: 400 })
  }

  if (createVaultSessionToken(password) !== expected) {
    return NextResponse.json({ authenticated: false, error: 'Invalid master password' }, { status: 401 })
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

export async function DELETE(): Promise<NextResponse> {
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
