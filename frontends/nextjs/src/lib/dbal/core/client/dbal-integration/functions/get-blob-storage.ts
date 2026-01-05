import { DBALClient, type DBALConfig } from '@/dbal'
import type { BlobStorage } from '@/dbal/blob/blob-storage'

export function getBlobStorage(this: any): BlobStorage {
  if (!this.blobStorage) {
    throw new Error('DBAL not initialized. Call initialize() first.')
  }
  return this.blobStorage
}
