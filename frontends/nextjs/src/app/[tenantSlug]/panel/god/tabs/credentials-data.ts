/** Tenant-name handling for the credentials tab. */

/** Re-exported so callers in this tab keep one import. */
export { readList as unwrapList } from '@/lib/dbal/read-list'

export function tenantLabel(tenantId: string): string {
  return tenantId === 'all' ? 'All tenants' : tenantId
}

/** A credential with no tenant belongs to the system tenant, not to none. */
export function normalizeTenant(value: string | null | undefined): string {
  return value != null && value.trim().length > 0 ? value.trim() : 'system'
}
