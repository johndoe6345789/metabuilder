/**
 * Users API Route - Demonstrates DBAL integration
 *
 * This API route forwards user management operations to the C++ DBAL daemon.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { requireDBALApiKey } from '@/lib/api/require-dbal-api-key'
import { setCredential } from '@/lib/db/credentials/set-credential'
import { hashPassword } from '@/lib/db/hash-password'
import { callDaemon } from '@/lib/dbal/daemon/client'
import type { User, UserRole } from '@/lib/level-types'

const RPC_LIMIT = 200

function normalizeRole(role?: string): UserRole {
  if (!role) return 'user'
  if (role === 'public') return 'user'
  return role as UserRole
}

async function readJson<T>(request: NextRequest): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    const listResult = await callDaemon<{
      data: User[]
      total: number
      page: number
      limit: number
      hasMore: boolean
    }>({
      entity: 'User',
      action: 'list',
      options: {
        limit: RPC_LIMIT,
      },
    })

    return NextResponse.json({
      users: listResult?.data ?? [],
      meta: {
        total: listResult?.total ?? 0,
        page: listResult?.page ?? 1,
        limit: listResult?.limit ?? 0,
        hasMore: Boolean(listResult?.hasMore),
      },
      source: 'C++ DBAL daemon',
    })
  } catch (error) {
    console.error('Error fetching users via DBAL daemon:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    const body = await readJson<{
      username?: string
      email?: string
      role?: string
      password?: string
    }>(request)

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    const user = await callDaemon<User>({
      entity: 'User',
      action: 'create',
      payload: {
        username,
        email,
        role: normalizeRole(body.role),
      },
    })

    const passwordHash = await hashPassword(password)
    await setCredential(user.username, passwordHash)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user via DBAL daemon:', error)
    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
