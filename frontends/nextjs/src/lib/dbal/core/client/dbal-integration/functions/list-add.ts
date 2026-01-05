import { DBALClient, type DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

export async function listAdd(
  this: any,
  key: string,
  items: JsonValue[],
  context: TenantContext
): Promise<void> {
  const fullKey = this.getKey(key, context)
  const existing = this.store.get(fullKey)?.value || []
  this.store.set(fullKey, { value: [...existing, ...items] })
}
