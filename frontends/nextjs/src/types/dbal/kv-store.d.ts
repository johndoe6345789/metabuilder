declare module '@/dbal/development/src/core/kv-store' {
  import type { TenantContext } from '@/dbal/development/src/core/tenant-context'
  import type { JsonValue } from '@/types/utility-types'

  export class InMemoryKVStore {
    get<T = JsonValue>(key: string, context?: TenantContext): Promise<T | null>
    set<T = JsonValue>(key: string, value: T, context?: TenantContext, ttl?: number): Promise<void>
    delete(key: string, context?: TenantContext): Promise<boolean>
    listAdd(key: string, items: JsonValue[], context?: TenantContext): Promise<void>
    listGet(key: string, context?: TenantContext, start?: number, end?: number): Promise<JsonValue[]>
  }
}
