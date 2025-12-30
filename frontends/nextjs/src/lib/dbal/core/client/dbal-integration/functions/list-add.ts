import { DBALClient, type DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

export async function listAdd(
  key: string,
  items: JsonValue[],
  context: TenantContext
): Promise<void> {
  const fullKey = this.getKey(key, context)
  const existing = this.store.get(fullKey)?.value || []
  this.store.set(fullKey, { value: [...existing, ...items] })
}
