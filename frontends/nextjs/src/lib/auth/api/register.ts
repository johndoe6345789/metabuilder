/**
 * Register API
 *
 * Creates a new user account with username, email, and password. The
 * Credential itself is provisioned through DBAL's own admin endpoint (real
 * Argon2id hashing) rather than hashed locally, so the account can actually
 * log in afterward through DBAL's OIDC /oidc/login -- which verifies against
 * Argon2id, not any locally-chosen scheme.
 */

import type { User } from '@/lib/types/level-types'
import type { DbalUserRecord } from '@/lib/auth/types'
import { db } from '@/lib/db-client'
import { DEFAULT_TENANT_ID } from '@/lib/tenant/workspace-paths'
import crypto from 'crypto'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  'http://localhost:8080'

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface RegisterResult {
  success: boolean
  user: User | null
  error?: string
}

async function createDbalCredential(
  username: string,
  password: string
): Promise<void> {
  const res = await fetch(`${DBAL_URL}/admin/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DBAL_ADMIN_TOKEN ?? ''}`,
    },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to provision credential: ${res.status} ${body}`)
  }
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  try {
    // Validate input
    if (username.length === 0 || email.length === 0 || password.length === 0) {
      return {
        success: false,
        user: null,
        error: 'Username, email, and password are required',
      }
    }

    // Check if username already exists
    const existingByUsername = await db.users.list({
      filter: { username },
    })

    if (existingByUsername.data.length > 0) {
      return {
        success: false,
        user: null,
        error: 'Username already exists',
      }
    }

    // Check if email already exists
    const existingByEmail = await db.users.list({
      filter: { email },
    })

    if (existingByEmail.data.length > 0) {
      return {
        success: false,
        user: null,
        error: 'Email already exists',
      }
    }

    // Create user
    const userId = crypto.randomUUID()

    const newUser = (await db.users.create({
      id: userId,
      username,
      email,
      // Self-service signup creates a community, so its founder gets the
      // God Panel (level 4) rather than plain member access (level 1) --
      // 'supergod' (level 5) is reserved for the instance owner and is
      // never assigned here.
      role: 'god',
      createdAt: Date.now(),
      isInstanceOwner: false,
      // Every DBAL list/filter query auto-adds `WHERE tenantId = '{route
      // tenant}'` (list_handler.cpp) -- this route is /system/core/User
      // (db-client.ts's TENANT default), so a row written with tenantId:
      // null here is permanently invisible to that filter afterward, even
      // though it's readable by direct id. That includes the exact list
      // query fetchSession() uses to resolve a login token to a user, so a
      // null tenantId here made every signup unable to log in at all, not
      // just miss some content.
      tenantId: DEFAULT_TENANT_ID,
      profilePicture: null,
      bio: null,
    })) as unknown as DbalUserRecord

    // Provision the Credential through DBAL's own admin endpoint so the
    // password is Argon2id-hashed the same way DBAL's OIDC login verifies it.
    await createDbalCredential(username, password)

    const user: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: Number(newUser.createdAt),
      isInstanceOwner: newUser.isInstanceOwner ?? false,
      tenantId: newUser.tenantId ?? null,
      profilePicture: newUser.profilePicture ?? null,
      bio: newUser.bio ?? null,
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}
