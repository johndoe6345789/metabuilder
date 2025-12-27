export * from './blob-storage'
export { MemoryStorage } from './providers/memory-storage'
export { S3Storage } from './providers/s3-storage'
export { FilesystemStorage } from './providers/filesystem-storage'
export { TenantAwareBlobStorage } from './providers/tenant-aware-storage'

import type { BlobStorage, BlobStorageConfig } from './blob-storage'
import { MemoryStorage } from './providers/memory-storage'
import { S3Storage } from './providers/s3-storage'
import { FilesystemStorage } from './providers/filesystem-storage'

/**
 * Factory function to create blob storage instances
 */
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
