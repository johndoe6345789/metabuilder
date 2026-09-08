export const DEFAULT_TENANT_ID = 'system'

export function normalizeTenantId(value?: string | null): string {
  const trimmed = value?.trim()
  if (trimmed == null || trimmed.length === 0) return DEFAULT_TENANT_ID
  return trimmed.replaceAll('/', '-')
}

/** The God Panel tab shown when a URL names no tab. */
export const DEFAULT_GOD_PANEL_TAB = 'overview'

/** /{tenant}/panel — where the app bar and sidebar live. */
export function tenantPanelPath(
  value?: string | null,
  section?: string
): string {
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
export function tenantPath(
  value: string | null | undefined,
  path: string
): string {
  const tenant = encodeURIComponent(normalizeTenantId(value))
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean === '/') return `/${tenant}/panel`
  if (clean.startsWith(`/${tenant}/panel`)) return clean
  return `/${tenant}/panel${clean}`
}

/**
 * Where the God Panel's "preview level N" buttons send the founder.
 *
 * Three copies of this table hard-coded '/', '/profile' and '/admin'.
 * Under basePath '/app' those resolve to /app/profile and /app/admin,
 * which Next matches as tenants named "profile" and "admin", finds no such
 * community, and 404s -- and '/' is the MetaBuilder marketing page, not
 * the founder's site. So "Home" in the builder's own header left the
 * product, and every Preview button on the first tab a founder lands on
 * was dead. Level 1 is the published site; the rest sit under the panel.
 * Null for a level with no page.
 */
export function previewPathForLevel(
  value: string | null | undefined,
  level: number
): string | null {
  const tenant = encodeURIComponent(normalizeTenantId(value))
  if (level === 1) return `/${tenant}`
  if (level === 2) return tenantPath(value, '/profile')
  if (level === 3) return tenantPath(value, '/admin')
  return null
}
