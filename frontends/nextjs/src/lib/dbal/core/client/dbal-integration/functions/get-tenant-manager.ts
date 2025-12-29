import { DBALClient, type DBALConfig } from '@/dbal'

export function getTenantManager(): InMemoryTenantManager {
    if (!this.tenantManager) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.tenantManager
  }
