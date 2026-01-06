import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

interface TenantLimits {
  maxStorage?: number
  maxUsers?: number
  maxApiCalls?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTenant(this: any, id: string, limits?: TenantLimits): Promise<void> {
  this.tenants.set(id, { limits: limits || {} })
}
