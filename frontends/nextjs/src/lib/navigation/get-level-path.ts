import type { AppLevel } from '../types/level-types'

/**
 * Map level numbers to canonical routes.
 */
export function getLevelPath(level: AppLevel): string {
  switch (level) {
    case 1:
      return '/'
    case 2:
      return '/dashboard'
    case 3:
      return '/moderator'
    case 4:
      return '/admin'
    case 5:
      return '/builder'
    case 6:
      return '/supergod'
    default:
      return '/'
  }
}
