import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

interface DBALIntegrationContext {
  tenantManager?: unknown
}

// TenantManager is not yet exported from DBAL, using unknown for now
export function getTenantManager(this: DBALIntegrationContext): unknown {
  if (!this.tenantManager) {
    throw new Error('DBAL not initialized. Call initialize() first.')
  }
  return this.tenantManager
}
