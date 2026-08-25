export const DEFAULT_TENANT_ID = 'system'

export function normalizeTenantId(value?: string | null): string {
  const trimmed = value?.trim()
  if (trimmed == null || trimmed.length === 0) return DEFAULT_TENANT_ID
  return trimmed.replaceAll('/', '-')
}

/** The God Panel tab shown when a URL names no tab. */
export const DEFAULT_GOD_PANEL_TAB = 'overview'

export function tenantGodPanelPath(
  value?: string | null,
  tabId?: string
): string {
  const base = `/${encodeURIComponent(normalizeTenantId(value))}/god-panel`
  return tabId == null ? base : `${base}/${encodeURIComponent(tabId)}`
}

/**
 * Prefix a workspace route with its tenant: "/dashboard" -> "/acme/dashboard".
 *
 * Signed in, every workspace route is served from its tenant-scoped twin
 * under [tenantSlug]/(workspace). Linking straight there avoids a visible
 * bounce through the redirect in the workspace layout.
 */
export function tenantPath(value: string | null | undefined, path: string): string {
  const tenant = encodeURIComponent(normalizeTenantId(value))
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean === '/') return `/${tenant}`
  if (clean === `/${tenant}` || clean.startsWith(`/${tenant}/`)) return clean
  return `/${tenant}${clean}`
}
