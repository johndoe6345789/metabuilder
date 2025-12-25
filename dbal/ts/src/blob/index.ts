export * from './blob-storage'
export { MemoryStorage } from './memory-storage'
export { S3Storage } from './s3-storage'
export { FilesystemStorage } from './filesystem-storage'
export { TenantAwareBlobStorage } from './tenant-aware-storage'

import type { BlobStorage, BlobStorageConfig } from './blob-storage'
import { MemoryStorage } from './memory-storage'
import { S3Storage } from './s3-storage'
import { FilesystemStorage } from './filesystem-storage'

/**
 * Factory function to create blob storage instances
 */
// TODO: add tests for createBlobStorage (memory, s3, filesystem, unknown type).
export function createBlobStorage(config: BlobStorageConfig): BlobStorage {
  switch (config.type) {
    case 'memory':
      return new MemoryStorage()
    
    case 's3':
      return new S3Storage(config)
    
    case 'filesystem':
      return new FilesystemStorage(config)
    
    default:
      throw new Error(`Unknown blob storage type: ${(config as any).type}`)
  }
}
