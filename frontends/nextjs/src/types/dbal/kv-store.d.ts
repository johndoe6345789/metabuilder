/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@/dbal/development/src/core/kv-store' {
  import type { TenantContext } from '@/dbal/development/src/core/tenant-context'

  export class InMemoryKVStore {
    get<T>(key: string, context?: TenantContext): Promise<T | null>
    set<T>(key: string, value: T, context?: TenantContext, ttl?: number): Promise<void>
    delete(key: string, context?: TenantContext): Promise<boolean>
    listAdd(key: string, items: any[], context?: TenantContext): Promise<void>
    listGet(key: string, context?: TenantContext, start?: number, end?: number): Promise<any[]>
  }
}
