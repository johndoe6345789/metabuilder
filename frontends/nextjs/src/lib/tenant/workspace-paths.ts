export const DEFAULT_TENANT_ID = 'system'

export function normalizeTenantId(value?: string | null): string {
  const trimmed = value?.trim()
  if (trimmed == null || trimmed.length === 0) return DEFAULT_TENANT_ID
  return trimmed.replaceAll('/', '-')
}

export function tenantGodPanelPath(value?: string | null): string {
  return `/${encodeURIComponent(normalizeTenantId(value))}/god-panel`
}
