/** Where each "preview level" quick tool sends the operator. */

import { BASE_PATH } from '@/lib/app-config'
import { previewPathForLevel } from '@/lib/tenant/workspace-paths'

/** The level a tool asks for, defaulting to the public site. */
export function toolLevel(params?: Record<string, unknown>): number {
  const level = params?.level
  return typeof level === 'number' ? level : 1
}

/**
 * The absolute URL for that level, or null if there is no page for it.
 * Absolute because this is handed to window.location.assign, which unlike
 * the router does not add the basePath -- so it is added here.
 */
export function previewTarget(
  origin: string,
  level: number,
  tenant: string
): string | null {
  const path = previewPathForLevel(tenant, level)
  return path === null ? null : `${origin}${BASE_PATH}${path}`
}
