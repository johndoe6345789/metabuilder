import { DBALClient, type DBALConfig } from '@/dbal'

export function getBlobStorage(): InMemoryBlobStorage {
    if (!this.blobStorage) {
      throw new Error('DBAL not initialized. Call initialize() first.')
    }
    return this.blobStorage
  }
