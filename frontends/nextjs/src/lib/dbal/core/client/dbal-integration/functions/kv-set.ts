import { DBALClient, type DBALConfig } from '@/dbal'

// KV Store operations
export async function kvSet(key: string, value: any, ttl?: number, tenantId = 'default', userId = 'system'): Promise<void> {
    if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
    const context = await this.tenantManager.getTenantContext(tenantId, userId)
    if (!context) throw new Error(`Tenant not found: ${tenantId}`)
    await this.kvStore.set(key, value, context, ttl)
  }
