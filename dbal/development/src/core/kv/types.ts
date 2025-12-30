import { TenantContext } from '../foundation/tenant-context'

export type StorableValue = string | number | boolean | null | object | StorableValue[]

export interface KVStoreEntry {
  key: string
  value: StorableValue
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  sizeBytes: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface KVListOptions {
  prefix?: string
  limit?: number
  cursor?: string
}

export interface KVListResult {
  entries: KVStoreEntry[]
  nextCursor?: string
  hasMore: boolean
}

export interface KVStore {
  get(key: string, context: TenantContext): Promise<StorableValue | null>
  set(key: string, value: StorableValue, context: TenantContext, ttl?: number): Promise<void>
  delete(key: string, context: TenantContext): Promise<boolean>
  exists(key: string, context: TenantContext): Promise<boolean>
  listAdd(key: string, items: StorableValue[], context: TenantContext): Promise<number>
  listGet(key: string, context: TenantContext, start?: number, end?: number): Promise<StorableValue[]>
  listRemove(key: string, value: StorableValue, context: TenantContext): Promise<number>
  listLength(key: string, context: TenantContext): Promise<number>
  listClear(key: string, context: TenantContext): Promise<void>
  mget(keys: string[], context: TenantContext): Promise<Map<string, StorableValue | null>>
  mset(entries: Map<string, StorableValue>, context: TenantContext): Promise<void>
  list(options: KVListOptions, context: TenantContext): Promise<KVListResult>
  count(prefix: string, context: TenantContext): Promise<number>
  clear(context: TenantContext): Promise<number>
}

export interface KVStoreState {
  data: Map<string, KVStoreEntry>
}
