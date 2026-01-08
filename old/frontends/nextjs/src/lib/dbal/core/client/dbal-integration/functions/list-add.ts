import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

export async function listAdd(
  this: { getKey: (key: string, context: TenantContext) => string; store: Map<string, { value: JsonValue }> },
  key: string,
  items: JsonValue[],
  context: TenantContext
): Promise<void> {
  const fullKey = this.getKey(key, context)
  const existing = (this.store.get(fullKey)?.value || []) as JsonValue[]
  this.store.set(fullKey, { value: [...existing, ...items] })
}
