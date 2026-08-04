import type { NextRequest } from 'next/server'

const DBAL_DAEMON_URL = process.env.DBAL_DAEMON_URL ?? 'http://localhost:8080'
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
 * Verifies the caller's own DBAL OIDC access token (sent as a normal
 * Authorization: Bearer header from the browser, via dbal-sso's
 * authenticatedFetch) is valid and carries an admin-level role, by asking
 * DBAL's own /oidc/userinfo to validate it -- this route never decodes or
 * trusts the JWT itself, DBAL is the sole source of truth for whether a
 * token is valid and what role it carries.
 *
 * Only on success does it hand back the real DBAL_ADMIN_TOKEN (a
 * server-only env var, never sent to the browser) for the caller to use
 * against DBAL's actual /admin/* endpoints. This replaces the previous
 * design where the browser held a static admin token directly (including a
 * hardcoded default committed to source) and sent it on every request.
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
