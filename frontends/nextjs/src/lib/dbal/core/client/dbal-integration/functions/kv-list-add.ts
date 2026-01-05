import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

export async function kvListAdd(
  key: string,
  items: JsonValue[],
  tenantId = 'default',
  userId = 'system'
): Promise<void> {
  if (!this.kvStore || !this.tenantManager) throw new Error('DBAL not initialized')
  const context = await this.tenantManager.getTenantContext(tenantId, userId)
  if (!context) throw new Error(`Tenant not found: ${tenantId}`)
  await this.kvStore.listAdd(key, items, context)
}
