/**
 * Verifies a DBAL OIDC access token server-side via /oidc/userinfo and
 * requires an admin-tier role -- this app exposes raw Postgres query/schema
 * access, so any authenticated DBAL user is not enough.
 */

const DBAL_URL = process.env.DBAL_ENDPOINT ?? 'http://localhost:8080'
const ADMIN_ROLES = new Set(['admin', 'god', 'supergod'])

interface UserinfoResponse {
  sub?: string
  role?: string
}

export async function verifyDbalAdminToken(token: string): Promise<string | null> {
  if (!token) return null
  try {
    const res = await fetch(`${DBAL_URL}/oidc/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const claims = await res.json() as UserinfoResponse
    if (!claims.sub || !claims.role || !ADMIN_ROLES.has(claims.role)) return null
    return claims.sub
  } catch {
    return null
  }
}
