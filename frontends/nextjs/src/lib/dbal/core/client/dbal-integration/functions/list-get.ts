import { DBALClient, type DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'

export async function listGet(
  key: string,
  context: TenantContext,
  start?: number,
  end?: number
): Promise<JsonValue[]> {
  const fullKey = this.getKey(key, context)
  const list = this.store.get(fullKey)?.value || []
  if (start !== undefined && end !== undefined) {
    return list.slice(start, end)
  }
  return list
}
