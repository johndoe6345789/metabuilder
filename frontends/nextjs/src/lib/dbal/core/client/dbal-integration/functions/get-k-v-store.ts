import { DBALClient, type DBALConfig } from '@/dbal'

export function getKVStore(): InMemoryKVStore {
    if (!this.kvStore) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.kvStore
  }
