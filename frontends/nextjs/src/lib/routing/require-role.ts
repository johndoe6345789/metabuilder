/**
 * Authenticating an API route caller from the session cookie.
 *
 * Two routes had grown their own copy of this -- read the cookie, ask DBAL
 * who it belongs to, compare the role level, answer 401 or 403 -- and they
 * had already drifted on which of the two statuses they returned and on the
 * shape of the error body. Getting that wrong leaks whether an account
 * exists, so it should be decided once.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/app/api/auth/session/route'
import { getRoleLevel, ROLE_LEVELS } from '@/lib/constants'
import { STATUS } from './index'

export interface SessionActor {
  id: string
  role: string
  level: number
  tenantId: string
}

export type RoleName = keyof typeof ROLE_LEVELS

/** Either the caller, or the response to send back instead. */
export type RoleCheck =
  | { ok: true; actor: SessionActor }
  | { ok: false; response: NextResponse }

function deny(error: string, status: number): RoleCheck {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  }
}

/**
 * The caller, if the session cookie names someone at `minRole` or above.
 *
 * A missing cookie is refused without asking DBAL anything -- there is no
 * token to verify, and a lookup would only add a timing signal.
 */
export async function requireRole(
  request: NextRequest,
  minRole: RoleName
): Promise<RoleCheck> {
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? null
  if (token === null) {
    return deny('Authentication required', STATUS.UNAUTHORIZED)
  }

  const user = await fetchSession(token)
  if (user === null) {
    return deny('Authentication required', STATUS.UNAUTHORIZED)
  }

  const role = typeof user.role === 'string' ? user.role : 'public'
  const level = getRoleLevel(role)
  if (level < ROLE_LEVELS[minRole]) {
    const label = minRole.charAt(0).toUpperCase() + minRole.slice(1)
    return deny(`${label} level access required`, STATUS.FORBIDDEN)
  }

  const tenantId =
    typeof user.tenantId === 'string' && user.tenantId.length > 0
      ? user.tenantId
      : 'system'

  return {
    ok: true,
    actor: { id: String(user.id ?? ''), role, level, tenantId },
  }
}
