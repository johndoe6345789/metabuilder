import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { JsonValue } from '@/types/utility-types'
import type { TenantContext } from '@/dbal/core/foundation/tenant-context'

export async function listGet(
  this: { getKey: (key: string, context: TenantContext) => string; store: Map<string, { value: JsonValue }> },
  key: string,
  context: TenantContext,
  start?: number,
  end?: number
): Promise<JsonValue[]> {
  const fullKey = this.getKey(key, context)
  const list = (this.store.get(fullKey)?.value || []) as JsonValue[]
  if (start !== undefined && end !== undefined) {
    return list.slice(start, end)
  }
  return list
}
