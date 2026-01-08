import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

// Global KV store for development
const kvStore = new Map<string, JsonValue>()

export async function kvGet<T = JsonValue>(
  key: string,
  _tenantId = 'default',
  _userId = 'system'
): Promise<T | null> {
  const fullKey = `${_tenantId}:${_userId}:${key}`
  const value = kvStore.get(fullKey)
  return (value as T) || null
}
