import { DBALClient, type DBALConfig } from '@/dbal'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

export async function getTenantContext(
  this: any,
  tenantId: string,
  userId: string
): Promise<TenantContext | null> {
  if (!this.tenants.has(tenantId)) {
    return null
  }
  return { tenantId, canRead: true, canWrite: true, canDelete: true }
}
