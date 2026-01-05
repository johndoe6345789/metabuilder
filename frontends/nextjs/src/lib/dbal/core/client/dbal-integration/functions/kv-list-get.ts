import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

export async function kvListGet(
  key: string,
  tenantId = 'default',
  userId = 'system',
  start?: number,
  end?: number
): Promise<JsonValue[]> {
  if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
  const context = await this.tenantManager.getTenantContext(tenantId, userId)
  if (!context) throw new Error(`Tenant not found: ${tenantId}`)
  return this.kvStore.listGet(key, context, start, end)
}
