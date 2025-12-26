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
      return '/admin'
    case 4:
      return '/builder'
    case 5:
      return '/supergod'
    default:
      return '/'
  }
}
