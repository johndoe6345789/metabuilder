import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

interface TenantStore {
  tenants: Map<string, unknown>
}

export async function getTenantContext(
  this: TenantStore,
  tenantId: string,
  _userId: string
): Promise<TenantContext | null> {
  if (!this.tenants.has(tenantId)) {
    return null
  }
  return { tenantId, canRead: true, canWrite: true, canDelete: true }
}
