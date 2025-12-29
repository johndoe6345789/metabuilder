import { DBALClient, type DBALConfig } from '@/dbal'

export async kvGet<T = any>(key: string, tenantId = 'default', userId = 'system'): Promise<T | null> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    return this.kvStore.get(key, context) as T | null
  }
