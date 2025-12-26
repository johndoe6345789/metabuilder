import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  dbalDeleteUser,
  dbalGetUserById,
  dbalUpdateUser,
  initializeDBAL,
} from '@/lib/dbal/database-dbal.server'
import { hashPassword } from '@/lib/db/hash-password'
import { setCredential } from '@/lib/db/credentials/set-credential'
import { requireDBALApiKey } from '@/lib/api/require-dbal-api-key'
import type { UserRole } from '@/lib/level-types'

function normalizeRole(role?: string): UserRole | undefined {
  if (!role) return undefined
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

interface RouteParams {
  params: {
    userId: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    await initializeDBAL()
    const user = await dbalGetUserById(params.userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    await initializeDBAL()

    const body = await readJson<{
      username?: string
      email?: string
      role?: string
      password?: string
      profilePicture?: string
      bio?: string
      tenantId?: string
      isInstanceOwner?: boolean
    }>(request)

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    if (body.username) {
      return NextResponse.json(
        { error: 'Username updates are not supported' },
        { status: 400 }
      )
    }

    const existingUser = await dbalGetUserById(params.userId)
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updates = {
      email: typeof body.email === 'string' ? body.email.trim() : undefined,
      role: normalizeRole(body.role),
      profilePicture: body.profilePicture,
      bio: body.bio,
      tenantId: body.tenantId,
      isInstanceOwner: body.isInstanceOwner,
    }

    const user = await dbalUpdateUser(params.userId, updates)

    if (typeof body.password === 'string' && body.password.length > 0) {
      const passwordHash = await hashPassword(body.password)
      await setCredential(existingUser.username, passwordHash)
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireDBALApiKey(request)
  if (unauthorized) {
    return unauthorized
  }
  try {
    await initializeDBAL()

    const existingUser = await dbalGetUserById(params.userId)
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await dbalDeleteUser(params.userId)
    await setCredential(existingUser.username, '')

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error deleting user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
