import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

interface TenantLimits {
  maxStorage?: number
  maxUsers?: number
  maxApiCalls?: number
}

export async function createTenant(id: string, limits?: TenantLimits): Promise<void> {
  this.tenants.set(id, { limits: limits || {} })
}
