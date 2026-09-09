/**
 * Where each "preview this level" card goes.
 *
 * The fourth copy of a table that has been wrong three times before (see
 * the dashboard tiles, the God Panel header and overview/preview-targets):
 * it hard-coded '/', '/dashboard' and '/admin', which under basePath
 * '/app' resolve to the marketing page and to two addresses Next reads as
 * tenants named "dashboard" and "admin" -- so it 404s. Three of the four
 * cards in this tab were dead. One helper answers it now.
 */

import {
  previewPathForLevel,
  tenantGodPanelPath,
} from '@/lib/tenant/workspace-paths'

export interface PreviewLevel {
  level: number
  name: string
  desc: string
}

export const PREVIEW_LEVELS: readonly PreviewLevel[] = [
  { level: 1, name: 'Public', desc: 'Landing page and public content' },
  { level: 2, name: 'User Area', desc: 'User dashboard and profile' },
  { level: 3, name: 'Admin Panel', desc: 'Data management interface' },
  { level: 4, name: 'God Panel', desc: 'System builder interface' },
]

/**
 * The path for one card. Level 4 is the God Panel, which
 * `previewPathForLevel` deliberately has no answer for -- it is where an
 * operator already is -- but this tab offers it as a destination.
 */
export function previewLevelHref(
  tenant: string | null | undefined,
  level: number
): string {
  return previewPathForLevel(tenant, level) ?? tenantGodPanelPath(tenant)
}
