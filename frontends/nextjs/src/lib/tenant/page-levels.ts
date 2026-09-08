/**
 * The access levels a founder can set on a page, and what one means.
 *
 * Matches ROLE_LEVELS (lib/constants.ts): 0=public, 1=user, 2=moderator,
 * 3=admin, 4=god, 5=supergod. The form that writes the field, the list
 * that shows it and the server gate that enforces it all read this one
 * table -- the list used to carry its own, off by one, and told a founder
 * a users-only page was public.
 */

import { getRoleLevel } from '@/lib/constants'

export interface PageLevelOption {
  value: number
  label: string
  desc: string
}

export const PAGE_LEVELS: readonly PageLevelOption[] = [
  { value: 0, label: 'Public', desc: 'Anyone can view' },
  { value: 1, label: 'User', desc: 'Logged-in users' },
  { value: 2, label: 'Moderator', desc: 'Moderators and up' },
  { value: 3, label: 'Admin', desc: 'Admin only' },
  { value: 4, label: 'God', desc: 'God tier' },
  { value: 5, label: 'SuperGod', desc: 'SuperGod only' },
]

/** The name of a level, or `L<n>` for one the form does not offer. */
export function pageLevelLabel(level: number): string {
  return PAGE_LEVELS.find(l => l.value === level)?.label ?? `L${level}`
}

/** The three fields that together decide who may see a page. */
export interface PageAccessFields {
  level: number
  requiresAuth: boolean
  requiredRole?: string | null
}

/**
 * The lowest role level a page may be shown to.
 *
 * Levels are a floor, not a match: `requireRole` reads them that way for
 * API routes, and a founder shutting a page to users below Admin plainly
 * does not mean to shut it to a God as well.
 */
export function requiredPageLevel(page: PageAccessFields): number {
  const role = page.requiredRole ?? ''
  const byRole = role === '' ? 0 : getRoleLevel(role)
  return Math.max(page.level, page.requiresAuth ? 1 : 0, byRole)
}
