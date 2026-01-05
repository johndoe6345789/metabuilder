import { DBALClient, type DBALConfig } from '@/dbal'

// TenantManager is not yet exported from DBAL, using any for now
export function getTenantManager(this: any): any {
  if (!this.tenantManager) {
    throw new Error('DBAL not initialized. Call initialize() first.')
  }
  return this.tenantManager
}
