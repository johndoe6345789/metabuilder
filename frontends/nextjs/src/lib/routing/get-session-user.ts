import { SESSION_COOKIE } from '@/lib/auth/session-cookie'

export interface SessionUser {
  user: Record<string, unknown> | null
}

/**
 * The app's own session cookie, out of a raw Cookie header.
 *
 * `entityApiFetch` forwards the incoming cookie so a Server Component can
 * call this API as the visitor -- its comment says exactly that -- and
 * nothing here read it, so every entity list, detail and edit page
 * answered "Authentication required" to a signed-in founder. Parsed by
 * hand because this is a plain Request, not a NextRequest with .cookies.
 */
function sessionCookie(req: Request): string | null {
  const header = req.headers.get('cookie')
  if (header === null) return null
  for (const part of header.split(';')) {
    const at = part.indexOf('=')
    if (at < 0) continue
    if (part.slice(0, at).trim() !== SESSION_COOKIE) continue
    const value = decodeURIComponent(part.slice(at + 1).trim())
    return value === '' ? null : value
  }
  return null
}

/** The caller, from a bearer token or the app's own session cookie. */
export async function getSessionUser(req?: Request): Promise<SessionUser> {
  try {
    const { fetchSession } = await import('@/lib/auth/api/fetch-session')
    const authHeader = req?.headers.get('authorization') ?? ''
    // A bearer token is the explicit choice and wins; the cookie is how
    // the browser and every server-side caller already identify.
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    const token =
      bearer ?? (req === undefined ? null : sessionCookie(req))
    const user = await fetchSession(token)

    if (user === null) return { user: null }

    // Convert User to Record<string, unknown> for compatibility.
    return {
      user: {
        ...user,
        tenantId: user.tenantId ?? null,
        profilePicture: user.profilePicture ?? null,
        bio: user.bio ?? null,
        isInstanceOwner: user.isInstanceOwner ?? false,
      },
    }
  } catch (error) {
    console.error('Error getting session user:', error)
    return { user: null }
  }
}
