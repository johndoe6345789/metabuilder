import { NextResponse } from 'next/server'
import { getSessionUser, STATUS } from '@/lib/routing'
import { getRoleLevel, ROLE_LEVELS } from '@/lib/constants'

export type GodLevelCheck = { ok: true } | { ok: false; response: Response }

/** Every schema-registry operation is god-only; GET and POST both
 *  need this exact check, so it lives in one place. */
export async function requireGodLevel(
  request: Request
): Promise<GodLevelCheck> {
  const session = await getSessionUser(request)

  if (session.user === null) {
    return {
      ok: false,
      response: NextResponse.json(
        { status: 'error', error: 'Authentication required' },
        { status: STATUS.UNAUTHORIZED }
      ),
    }
  }

  const userRole = (session.user as { role?: string }).role ?? 'public'
  if (getRoleLevel(userRole) < ROLE_LEVELS.god) {
    return {
      ok: false,
      response: NextResponse.json(
        { status: 'error', error: 'God level access required' },
        { status: STATUS.FORBIDDEN }
      ),
    }
  }

  return { ok: true }
}
