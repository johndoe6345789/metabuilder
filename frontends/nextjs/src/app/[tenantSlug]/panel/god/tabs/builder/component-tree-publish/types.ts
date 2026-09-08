export interface PublishTarget {
  tenant: string
  path: string
  title: string
  /**
   * 0=public, 1=user, 2=moderator, 3=admin, 4=god, 5=supergod — see
   * ROLE_LEVELS.
   *
   * Optional, and omitted means "whatever this path already had". BQL
   * hard-coded 0 and false for every page it published, so re-running a
   * script over an existing Admin-only route quietly made it public. The
   * builder still says what it means, because its picker is where a
   * founder sets this; a caller with no opinion should not be made to
   * invent one.
   */
  level?: number
  requiresAuth?: boolean
}

export const DEFAULT_PUBLISH_TARGET: PublishTarget = {
  tenant: 'system',
  path: '/',
  title: 'Home',
  level: 0,
  requiresAuth: false,
}
