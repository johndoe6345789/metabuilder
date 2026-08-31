export interface RouteUser {
  id: string
  role: string
  tenantId: string | null
}

/** Normalizes the loosely-typed session record into the shape route
 *  handlers rely on -- a non-string role defaults to 'public' rather
 *  than letting an unexpected session shape widen access. */
export function resolveUser(
  rawUser: Record<string, unknown> | null
): RouteUser | null {
  if (rawUser === null) return null
  return {
    id: typeof rawUser.id === 'string' ? rawUser.id : '',
    role: typeof rawUser.role === 'string' ? rawUser.role : 'public',
    tenantId: typeof rawUser.tenantId === 'string' ? rawUser.tenantId : null,
  }
}
