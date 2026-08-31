export interface PublishTarget {
  tenant: string
  path: string
  title: string
  /**
   * 0=public, 1=user, 2=moderator, 3=admin, 4=god, 5=supergod — see ROLE_LEVELS
   */
  level: number
  requiresAuth: boolean
}

export const DEFAULT_PUBLISH_TARGET: PublishTarget = {
  tenant: 'system',
  path: '/',
  title: 'Home',
  level: 0,
  requiresAuth: false,
}
