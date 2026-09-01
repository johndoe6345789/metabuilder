/** Where each "preview level" quick tool sends the operator. */

import { BASE_PATH } from '@/lib/app-config'

// Partial, not Record: level is an arbitrary number, and most levels
// don't have a page.
const PATH_BY_LEVEL: Partial<Record<number, string>> = {
  1: '/',
  2: '/profile',
  3: '/admin',
}

/** The level a tool asks for, defaulting to the public site. */
export function toolLevel(params?: Record<string, unknown>): number {
  const level = params?.level
  return typeof level === 'number' ? level : 1
}

/** The absolute URL for that level, or null if there is no page for it. */
export function previewTarget(origin: string, level: number): string | null {
  const path = PATH_BY_LEVEL[level]
  return path === undefined ? null : `${origin}${BASE_PATH}${path}`
}
