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
