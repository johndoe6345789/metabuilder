import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

interface StoreContext {
  getKey: (key: string, context: TenantContext) => string
  store: Map<string, { value: JsonValue; expiry?: number }>
}

export async function set(
  this: StoreContext,
  key: string,
  value: JsonValue,
  context: TenantContext,
  ttl?: number
): Promise<void> {
  const fullKey = this.getKey(key, context)
  const expiry = ttl ? Date.now() + ttl * 1000 : undefined
  this.store.set(fullKey, { value, expiry })
}
