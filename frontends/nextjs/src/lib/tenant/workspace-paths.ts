export const DEFAULT_TENANT_ID = 'system'

export function normalizeTenantId(value?: string | null): string {
  const trimmed = value?.trim()
  if (trimmed == null || trimmed.length === 0) return DEFAULT_TENANT_ID
  return trimmed.replaceAll('/', '-')
}

/** The God Panel tab shown when a URL names no tab. */
export const DEFAULT_GOD_PANEL_TAB = 'overview'

/** /{tenant}/panel — where the app bar and sidebar live. */
export function tenantPanelPath(value?: string | null, section?: string): string {
  const base = `/${encodeURIComponent(normalizeTenantId(value))}/panel`
  return section == null ? base : `${base}/${section.replace(/^\/+/, '')}`
}

export function tenantGodPanelPath(
  value?: string | null,
  tabId?: string
): string {
  const base = tenantPanelPath(value, 'god')
  return tabId == null ? base : `${base}/${encodeURIComponent(tabId)}`
}

/**
 * Where a workspace route lives: "/dashboard" -> "/acme/panel/dashboard".
 *
 * These are the pages with chrome, so they sit under the panel. A published
 * page keeps the bare /{tenant}/{route} shape and does not go through here.
 */
export function tenantPath(value: string | null | undefined, path: string): string {
  const tenant = encodeURIComponent(normalizeTenantId(value))
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean === '/') return `/${tenant}/panel`
  if (clean.startsWith(`/${tenant}/panel`)) return clean
  return `/${tenant}/panel${clean}`
}
