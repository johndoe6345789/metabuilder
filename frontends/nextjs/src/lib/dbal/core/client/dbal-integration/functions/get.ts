import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

interface StoreContext {
  getKey: (key: string, context: TenantContext) => string
  store: Map<string, { value: JsonValue; expiry?: number }>
}

export async function get(this: StoreContext, key: string, context: TenantContext): Promise<JsonValue | null> {
  const fullKey = this.getKey(key, context)
  const item = this.store.get(fullKey)
  if (!item) return null
  if (item.expiry && Date.now() > item.expiry) {
    this.store.delete(fullKey)
    return null
  }
  return item.value
}
