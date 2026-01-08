import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'
import type { KVStore } from '@/dbal/core/kv/types'

 
export function getKVStore(this: any): KVStore {
  if (!this.kvStore) {
    throw new Error('DBAL not initialized. Call initialize() first.')
  }
  return this.kvStore
}
