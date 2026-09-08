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

/**
 * Creates the User row through the admin token, not the plain db-client.
 *
 * `role` is a privileged field -- DBAL rejects any anonymous write that
 * sets it, the same guard that blocks isInstanceOwner, so an unauthenticated
 * request could never mint the 'god' role a self-service founder needs.
 * This route already holds DBAL_ADMIN_TOKEN and uses it below to provision
 * the Credential; using it here too is the same trust, not a new one.
 */
async function createDbalUser(
  tenantId: string,
  data: Record<string, unknown>
): Promise<DbalUserRecord> {
  const res = await fetch(`${DBAL_URL}/${tenantId}/core/User`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DBAL_ADMIN_TOKEN ?? ''}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to create user: ${res.status} ${body}`)
  }
  const raw = (await res.json()) as { data?: unknown }
  return (raw.data ?? raw) as DbalUserRecord
}

async function createDbalCredential(
  username: string,
  password: string,
  tenantId: string,
  email: string
): Promise<void> {
  const res = await fetch(`${DBAL_URL}/admin/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DBAL_ADMIN_TOKEN ?? ''}`,
    },
    body: JSON.stringify({ username, password, tenantId, email }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to provision credential: ${res.status} ${body}`)
  }
}

/**
 * Remove a User row this registration wrote and then could not finish.
 *
 * Best-effort and deliberately quiet: the founder needs to see the error
 * that stopped provisioning, not this one. But it has to be tried --
 * without it the row stayed behind, the retry hit "That community name is
 * already taken" (which checks for *any* user in the tenant), and the
 * name was burned with no account able to log in.
 */
async function discardDbalUser(tenantId: string, id: string): Promise<void> {
  await fetch(`${DBAL_URL}/${tenantId}/core/User/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${process.env.DBAL_ADMIN_TOKEN ?? ''}` },
  }).catch(() => null)
}

/**
 * The answer when a uniqueness check could not read its data.
 *
 * listEntity swallows any error into `{ data: [] }`, so a DBAL timeout was
 * indistinguishable from "nobody has that name" -- and what follows a
 * passed check here is an account created with role 'god' inside the very
 * tenant being checked. A guard that cannot see has to refuse.
 *
 * The wording says nothing about which check it was or whether the name
 * exists: this is a public form, and an anonymous caller should learn only
 * that it did not go through.
 */
const UNVERIFIED: RegisterResult = {
  success: false,
  user: null,
  error: 'Could not complete signup just now. Please try again.',
}

export async function register(
  username: string,
  email: string,
  password: string,
  tenantName?: string
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

    // A named signup founds its own community; DBAL's OIDC login flow
    // resolves and signs this same tenantId into the access token from the
    // Credential row (see LoginRouteHandler), and fetchSession() reads it
    // back from /oidc/userinfo -- so the User row created here, the
    // Credential provisioned below, and every future login all agree on
    // which tenant this account belongs to.
    const foundingNewTenant = tenantName != null && tenantName.length > 0
    const tenantId = foundingNewTenant ? tenantName : DEFAULT_TENANT_ID
    const users = db.entity('User', tenantId)

    // Only a *named* community can be "already taken" -- 'system' is the
    // shared bucket every un-named signup lands in, not owned by any one
    // founder, so it has no founding-collision to guard against.
    if (foundingNewTenant) {
      const existingMembers = await users.list({})
      if (existingMembers.failed === true) return UNVERIFIED
      if (existingMembers.data.length > 0) {
        return {
          success: false,
          user: null,
          error: 'That community name is already taken',
        }
      }
    }

    // Check if username already exists (within this tenant -- global
    // username uniqueness is enforced independently by Credential's own
    // primary key, see createDbalCredential)
    const existingByUsername = await users.list({
      filter: { username },
    })

    if (existingByUsername.failed === true) return UNVERIFIED
    if (existingByUsername.data.length > 0) {
      return {
        success: false,
        user: null,
        error: 'Username already exists',
      }
    }

    // Check if email already exists (within this tenant)
    const existingByEmail = await users.list({
      filter: { email },
    })

    if (existingByEmail.failed === true) return UNVERIFIED
    if (existingByEmail.data.length > 0) {
      return {
        success: false,
        user: null,
        error: 'Email already exists',
      }
    }

    // Create user
    const userId = crypto.randomUUID()

    const newUser = await createDbalUser(tenantId, {
      id: userId,
      username,
      email,
      // Self-service signup creates a community, so its founder gets the
      // God Panel (level 4) rather than plain member access (level 1) --
      // 'supergod' (level 5) is reserved for the instance owner and is
      // never assigned here.
      role: 'god',
      createdAt: Date.now(),
      // Never sent: isInstanceOwner is privileged, and DBAL rejects any
      // anonymous write that sets it at all -- even to its own default of
      // false (see the sibling dbal repo's write-authorization check). The
      // User schema already defaults it, so omitting the key is correct,
      // not merely convenient.
      tenantId,
      profilePicture: null,
      bio: null,
    })

    // Provision the Credential through DBAL's own admin endpoint so the
    // password is Argon2id-hashed the same way DBAL's OIDC login verifies
    // it, and so login resolves this same tenantId (see the comment above).
    // The email is stored alongside username as a second login identifier
    // (see DBAL's verifyCredentialIdentifier) -- username here is a
    // system-generated community slug a founder was never shown or asked
    // to remember, so signing back in with the email they typed at signup
    // has to work too, not just the slug.
    try {
      await createDbalCredential(username, password, tenantId, email)
    } catch (cause) {
      // The User row is already written. Left there, the retry reads the
      // community as taken and the founder can neither sign in nor start
      // again; the rest of the catch below returns the real reason.
      await discardDbalUser(tenantId, newUser.id)
      throw cause
    }

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
