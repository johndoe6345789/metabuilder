import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

export async function kvDelete(
  key: string,
  tenantId = 'default',
  userId = 'system'
): Promise<boolean> {
  if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
  const context = await this.tenantManager.getTenantContext(tenantId, userId)
  if (!context) throw new Error(`Tenant not found: ${tenantId}`)
  return this.kvStore.delete(key, context)
}
