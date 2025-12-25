/**
 * Users API Route - Demonstrates DBAL integration
 * 
 * This API route uses DBAL for all database operations, showcasing
 * the proper server-side integration of the DBAL layer.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { dbalAddUser, dbalGetUsers, initializeDBAL } from '@/lib/dbal/database-dbal.server'
import { hashPassword } from '@/lib/db/hash-password'
import { setCredential } from '@/lib/db/credentials/set-credential'
import type { UserRole } from '@/lib/level-types'

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

export async function GET() {
  try {
    // Initialize DBAL on first use
    await initializeDBAL()
    
    // Use DBAL to fetch users
    const users = await dbalGetUsers()
    
    return NextResponse.json({ 
      users,
      source: 'DBAL' 
    })
  } catch (error) {
    console.error('Error fetching users via DBAL:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    const user = await dbalAddUser({
      username,
      email,
      role: normalizeRole(body.role),
      profilePicture: body.profilePicture,
      bio: body.bio,
      tenantId: body.tenantId,
      isInstanceOwner: body.isInstanceOwner,
    })

    const passwordHash = await hashPassword(password)
    await setCredential(user.username, passwordHash)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user via DBAL:', error)
    return NextResponse.json(
      {
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
