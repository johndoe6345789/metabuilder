import { DBALClient, type DBALConfig } from '@/dbal'

export async function listGet(
  key: string,
  context: TenantContext,
  start?: number,
  end?: number
): Promise<any[]> {
  const fullKey = this.getKey(key, context)
  const list = this.store.get(fullKey)?.value || []
  if (start !== undefined && end !== undefined) {
    return list.slice(start, end)
  }
  return list
}
