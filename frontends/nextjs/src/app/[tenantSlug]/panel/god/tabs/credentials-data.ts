/** Reading DBAL list responses, which are not consistently shaped. */

/**
 * A list endpoint answers a bare array, `{data: [...]}` or `{data:{data:
 * [...]}}` depending on which layer handled it. Callers that guessed wrong
 * silently rendered an empty table, so the unwrapping lives in one place.
 */
export function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw === null || typeof raw !== 'object') return []

  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data as T[]

  if (obj.data !== null && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>
    if (Array.isArray(nested.data)) return nested.data as T[]
  }
  return []
}

export function tenantLabel(tenantId: string): string {
  return tenantId === 'all' ? 'All tenants' : tenantId
}

/** A credential with no tenant belongs to the system tenant, not to none. */
export function normalizeTenant(value: string | null | undefined): string {
  return value != null && value.trim().length > 0 ? value.trim() : 'system'
}
