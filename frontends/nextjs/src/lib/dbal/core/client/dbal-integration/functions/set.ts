import { DBALClient, type DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

export async function set(
  key: string,
  value: JsonValue,
  context: TenantContext,
  ttl?: number
): Promise<void> {
  const fullKey = this.getKey(key, context)
  const expiry = ttl ? Date.now() + ttl * 1000 : undefined
  this.store.set(fullKey, { value, expiry })
}
