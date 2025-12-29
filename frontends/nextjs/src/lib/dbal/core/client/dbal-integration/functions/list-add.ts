import { DBALClient, type DBALConfig } from '@/dbal'

export async function listAdd(key: string, items: any[], context: TenantContext): Promise<void> {
    const fullKey = this.getKey(key, context)
    const existing = this.store.get(fullKey)?.value || []
    this.store.set(fullKey, { value: [...existing, ...items] })
  }
