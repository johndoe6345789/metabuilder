import type { TenantContext } from '../foundation/tenant-context'
import type { KVListOptions, KVListResult, KVStore, KVStoreState, StorableValue } from './types'
import { clear, count, listEntries, mget, mset } from './operations/batch'
import { getValue, exists, listGet, listLength } from './operations/read'
import { deleteValue, listAdd, listClear, listRemove, setValue } from './operations/write'

export class InMemoryKVStore implements KVStore {
  private state: KVStoreState = { data: new Map() }

  get(key: string, context: TenantContext): Promise<StorableValue | null> {
    return getValue(this.state, key, context)
  }

  set(key: string, value: StorableValue, context: TenantContext, ttl?: number): Promise<void> {
    return setValue(this.state, key, value, context, ttl)
  }

  delete(key: string, context: TenantContext): Promise<boolean> {
    return deleteValue(this.state, key, context)
  }

  exists(key: string, context: TenantContext): Promise<boolean> {
    return exists(this.state, key, context)
  }

  listAdd(key: string, items: StorableValue[], context: TenantContext): Promise<number> {
    return listAdd(this.state, key, items, context)
  }

  listGet(key: string, context: TenantContext, start?: number, end?: number): Promise<StorableValue[]> {
    return listGet(this.state, key, context, start, end)
  }

  listRemove(key: string, value: StorableValue, context: TenantContext): Promise<number> {
    return listRemove(this.state, key, value, context)
  }

  listLength(key: string, context: TenantContext): Promise<number> {
    return listLength(this.state, key, context)
  }

  listClear(key: string, context: TenantContext): Promise<void> {
    return listClear(this.state, key, context)
  }

  mget(keys: string[], context: TenantContext): Promise<Map<string, StorableValue | null>> {
    return mget(this.state, keys, context)
  }

  mset(entries: Map<string, StorableValue>, context: TenantContext): Promise<void> {
    return mset(this.state, entries, context)
  }

  list(options: KVListOptions, context: TenantContext): Promise<KVListResult> {
    return listEntries(this.state, options, context)
  }

  count(prefix: string, context: TenantContext): Promise<number> {
    return count(prefix, this.state, context)
  }

  clear(context: TenantContext): Promise<number> {
    return clear(this.state, context)
  }
}

export type { KVStoreEntry, KVListOptions, KVListResult, StorableValue } from './types'
