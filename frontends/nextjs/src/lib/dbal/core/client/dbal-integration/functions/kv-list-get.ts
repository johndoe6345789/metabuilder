import { DBALClient, type DBALConfig } from '@/dbal'

export async function kvListGet(
  key: string,
  tenantId = 'default',
  userId = 'system',
  start?: number,
  end?: number
): Promise<any[]> {
  if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
  const context = await this.tenantManager.getTenantContext(tenantId, userId)
  if (!context) throw new Error(`Tenant not found: ${tenantId}`)
  return this.kvStore.listGet(key, context, start, end)
}
