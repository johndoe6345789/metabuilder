/** The pure decisions PageRoutesTab makes: no fetch, no state. */

import { BASE_PATH } from '@/lib/app-config'
import type { PageRoute } from '@/hooks/usePageRoutes'

export const SYSTEM_TENANT = 'system'

/** A blank or whitespace-only tenant name falls back to system. */
export function normalizeTenant(input: string): string {
  const trimmed = input.trim()
  return trimmed.length > 0 ? trimmed : SYSTEM_TENANT
}

/**
 * Where "Preview" opens.
 *
 * A path that is already a full URL (an external page) is opened as-is;
 * anything else is resolved against this tenant's own workspace, with a
 * leading slash added if the stored path doesn't have one.
 */
export function previewUrl(
  page: Pick<PageRoute, 'path'>,
  tenant: string,
  origin: string
): string {
  if (page.path.startsWith('http')) return page.path
  const path = page.path.startsWith('/') ? page.path : `/${page.path}`
  return `${origin}${BASE_PATH}/${tenant}${path}`
}

/** How many of these pages are live versus still a draft. */
export function publishCounts(pages: Pick<PageRoute, 'isPublished'>[]): {
  live: number
  draft: number
} {
  const live = pages.filter(p => p.isPublished).length
  return { live, draft: pages.length - live }
}
