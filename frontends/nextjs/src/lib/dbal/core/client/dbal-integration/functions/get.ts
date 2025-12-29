import { DBALClient, type DBALConfig } from '@/dbal'

export async function get(key: string, context: TenantContext): Promise<any | null> {
    const fullKey = this.getKey(key, context)
    const item = this.store.get(fullKey)
    if (!item) return null
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(fullKey)
      return null
    }
    return item.value
  }
