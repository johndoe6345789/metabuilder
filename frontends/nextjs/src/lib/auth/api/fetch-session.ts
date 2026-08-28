/**
 * Fetch current session
 *
 * Verifies a DBAL OIDC access token against /oidc/userinfo, then loads the
 * full profile from the DBAL User entity. Replaces the old cookie-backed
 * session-table lookup now that login goes through DBAL's own OIDC flow
 * (the client holds the token; there is no server-side session record).
 */

import type { User } from '@/lib/types/level-types'
import type { DbalUserRecord } from '@/lib/auth/types'
import { db } from '@/lib/db-client'

const DBAL_URL =
  process.env.DBAL_ENDPOINT ??
  process.env.DBAL_API_URL ??
  'http://localhost:8080'

interface UserinfoResponse {
  sub?: string
}

/**
 * Fetch the current session user for a DBAL OIDC access token
 *
 * @returns User if the token is valid, null otherwise
 */
export async function fetchSession(token: string | null): Promise<User | null> {
  if (token === null || token.length === 0) {
    return null
  }

  try {
    const userinfoRes = await fetch(`${DBAL_URL}/oidc/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!userinfoRes.ok) {
      return null
    }
    const claims = (await userinfoRes.json()) as UserinfoResponse
    if (claims.sub === undefined || claims.sub.length === 0) {
      return null
    }

    const users = await db.users.list({ filter: { username: claims.sub } })
    const user = users.data[0] as unknown as DbalUserRecord | undefined
    if (user === undefined) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isInstanceOwner: user.isInstanceOwner ?? false,
      profilePicture: user.profilePicture ?? null,
      bio: user.bio ?? null,
      createdAt: Number(user.createdAt),
      tenantId: user.tenantId ?? null,
    }
  } catch (error) {
    console.error('Error fetching session:', error)
    return null
  }
}
