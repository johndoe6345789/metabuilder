import { DBALClient, type DBALConfig } from '@/dbal'

export async function createTenant(id: string, limits?: any): Promise<void> {
  this.tenants.set(id, { limits: limits || {} })
}
