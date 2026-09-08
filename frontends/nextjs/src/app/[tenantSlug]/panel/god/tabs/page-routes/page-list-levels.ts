/** How the route list colours a page's access level chip. */

import type { PageAccessFields } from '@/lib/tenant/page-levels'
import { requiredPageLevel } from '@/lib/tenant/page-levels'

const LEVEL_COLORS = [
  'default',
  'default',
  'info',
  'warning',
  'error',
  'secondary',
] as const

export type LevelColor = (typeof LEVEL_COLORS)[number]

export function levelColor(level: number): LevelColor {
  return LEVEL_COLORS[level] ?? 'default'
}

/**
 * What the visibility chip says.
 *
 * It used to read `requiresAuth` alone, so an Admin-only page showed
 * "Public" beside its "Admin" chip. The server gate takes the highest of
 * level, requiresAuth and requiredRole; so does this.
 */
export function visibilityLabel(page: PageAccessFields): 'Public' | 'Sign-in' {
  return requiredPageLevel(page) > 0 ? 'Sign-in' : 'Public'
}
