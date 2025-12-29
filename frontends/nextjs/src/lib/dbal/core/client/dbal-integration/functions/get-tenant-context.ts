import { DBALClient, type DBALConfig } from '@/dbal'

export async function getTenantContext(tenantId: string, userId: string): Promise<TenantContext | null> {
    if (!this.tenants.has(tenantId)) {
      return null
    }
    return { tenantId, userId }
  }
