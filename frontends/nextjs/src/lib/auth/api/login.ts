/**
 * Login API
 *
 * Authenticates a user and returns user data on success
 */

import type { User } from '@/lib/types/level-types'
import type { DbalUserRecord, DbalCredentialRecord } from '@/lib/auth/types'
import { db } from '@/lib/db-client'
import crypto from 'crypto'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  success: boolean
  user: User | null
  error?: string
  requiresPasswordChange?: boolean
}

/**
 * Hash password using SHA-512
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha512').update(password).digest('hex')
}

/**
 * Verify password against hash
 */
function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password)
  return passwordHash === hash
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  try {
    // Find user by username or email
    const users = await db.users.list({
      filter: {
        username: identifier
      }
    })

    let user = users.data[0] as DbalUserRecord | undefined

    // If not found by username, try email
    if (user === undefined) {
      const usersByEmail = await db.users.list({
        filter: {
          email: identifier
        }
      })
      user = usersByEmail.data[0] as DbalUserRecord | undefined
    }

    if (user === undefined) {
      return {
        success: false,
        user: null,
        error: 'Invalid username or password',
      }
    }

    // Get credential — Credential entity lives in the 'access' package, not 'core'
    const credUrl = `${
      process.env.DBAL_API_URL ??
      process.env.DBAL_ENDPOINT ??
      'http://localhost:8080'
    }/system/access/Credential?filter.username=${encodeURIComponent(user.username)}`

    let credential: DbalCredentialRecord | null = null
    try {
      const credRes = await fetch(credUrl, {
        headers: { Accept: 'application/json' },
        cache: 'no-store' as RequestCache,
      })
      if (credRes.ok) {
        const raw = await credRes.json() as { data?: { data?: DbalCredentialRecord[] } }
        credential = raw?.data?.data?.[0] ?? null
      }
    } catch {
      // fallback: try via db.credentials (core package) in case routing changed
      const credResult = await db.credentials.list({
        filter: { username: user.username },
      })
      credential = (credResult.data[0] as DbalCredentialRecord | undefined) ?? null
    }

    if (credential?.passwordHash === undefined) {
      return {
        success: false,
        user: null,
        error: 'Invalid username or password',
      }
    }

    // Verify password
    const isValid = verifyPassword(password, String(credential.passwordHash))

    if (!isValid) {
      return {
        success: false,
        user: null,
        error: 'Invalid username or password',
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isInstanceOwner: user.isInstanceOwner ?? false,
        profilePicture: user.profilePicture ?? null,
        bio: user.bio ?? null,
        createdAt: Number(user.createdAt),
        tenantId: user.tenantId ?? null,
      },
      requiresPasswordChange: false,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}
