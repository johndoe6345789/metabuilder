export interface SessionUser {
  user: Record<string, unknown> | null
}

/** The caller's DBAL OIDC bearer token, resolved to a user record. */
export async function getSessionUser(req?: Request): Promise<SessionUser> {
  try {
    const { fetchSession } = await import('@/lib/auth/api/fetch-session')
    const authHeader = req?.headers.get('authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
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
