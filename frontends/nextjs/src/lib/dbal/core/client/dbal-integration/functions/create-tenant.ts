import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

interface TenantLimits {
  maxStorage?: number
  maxUsers?: number
  maxApiCalls?: number
}

interface TenantContext {
  tenants: Map<string, { limits: TenantLimits }>
}

export async function createTenant(this: TenantContext, id: string, limits?: TenantLimits): Promise<void> {
  this.tenants.set(id, { limits: limits || {} })
}
