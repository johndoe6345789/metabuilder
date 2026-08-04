import type { NextRequest } from 'next/server'

const DBAL_DAEMON_URL = process.env.DBAL_DAEMON_URL ?? 'http://dbal:8080'
const ADMIN_ROLES = new Set(['admin', 'god', 'supergod'])

export interface AdminAuthResult {
  ok: true
  adminToken: string
}

export interface AdminAuthFailure {
  ok: false
  status: number
  error: string
}

/**
 * Verifies the caller's own DBAL OIDC access token (Authorization header)
 * carries an admin-level role, by asking DBAL's own /oidc/userinfo --
 * mirrors frontends/dbal/src/adminAuth.ts, written for the exact same
 * reason: dbalAdminConfig.ts's getDBALConfig/getDBALAdapters/
 * switchDBALAdapter/seedDBAL previously called DBAL's /admin/* endpoints
 * directly from the browser with a DBAL_ADMIN_TOKEN that (correctly, since
 * it's not NEXT_PUBLIC_-prefixed) was always empty client-side -- not a
 * credential leak, but those admin actions silently failed to
 * authenticate whenever triggered from the UI. Only on success does this
 * hand back the real DBAL_ADMIN_TOKEN (server-only env var) for the
 * caller to use.
 */
export async function verifyAdminCaller(req: NextRequest): Promise<AdminAuthResult | AdminAuthFailure> {
  const authHeader = req.headers.get('authorization') ?? ''
  const callerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!callerToken) {
    return { ok: false, status: 401, error: 'Missing Authorization header' }
  }

  const adminToken = process.env.DBAL_ADMIN_TOKEN
  if (!adminToken) {
    return { ok: false, status: 500, error: 'DBAL_ADMIN_TOKEN not configured on server' }
  }

  let userinfo: { role?: string; sub?: string }
  try {
    const res = await fetch(`${DBAL_DAEMON_URL}/oidc/userinfo`, {
      headers: { Authorization: `Bearer ${callerToken}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) {
      return { ok: false, status: 401, error: 'Invalid or expired session' }
    }
    userinfo = await res.json()
  } catch {
    return { ok: false, status: 502, error: 'Could not reach DBAL to verify session' }
  }

  if (!userinfo.role || !ADMIN_ROLES.has(userinfo.role)) {
    return { ok: false, status: 403, error: 'Admin role required' }
  }

  return { ok: true, adminToken }
}
