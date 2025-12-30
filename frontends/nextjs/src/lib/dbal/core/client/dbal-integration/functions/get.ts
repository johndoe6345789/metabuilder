import { DBALClient, type DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

export async function get(key: string, context: TenantContext): Promise<JsonValue | null> {
  const fullKey = this.getKey(key, context)
  const item = this.store.get(fullKey)
  if (!item) return null
  if (item.expiry && Date.now() > item.expiry) {
    this.store.delete(fullKey)
    return null
  }
  return item.value
}
