/**
 * POST /api/auth/register
 *
 * Creates a new user account and its DBAL Credential. Does not sign the
 * caller in -- the client redirects to DBAL's OIDC login afterward, same as
 * any other account, so there is no separate registration session mechanism
 * to keep in sync with the OIDC-issued one.
 */

import { NextResponse } from 'next/server'
import { register } from '@/lib/auth/api/register'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as {
      username?: string
      email?: string
      password?: string
      tenantName?: string
    }
    const { username, email, password, tenantName } = body

    if (
      username === undefined ||
      email === undefined ||
      password === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          error: 'Username, email, and password are required',
        },
        { status: 400 }
      )
    }

    const result = await register(username, email, password, tenantName)

    if (!result.success || result.user === null) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Register route error:', error)
    return NextResponse.json(
      { success: false, user: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
