export * from './blob-storage'
export { MemoryStorage } from './providers/memory-storage'
export { S3Storage } from './providers/s3'
// FilesystemStorage requires Node.js fs module - only available on server
// export { FilesystemStorage } from './providers/filesystem'
export { TenantAwareBlobStorage } from './providers/tenant-aware-storage'

import type { BlobStorage, BlobStorageConfig } from './blob-storage'
import { MemoryStorage } from './providers/memory-storage'
import { S3Storage } from './providers/s3'
// import { FilesystemStorage } from './providers/filesystem'

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
      // Dynamically import FilesystemStorage only on server (Node.js)
      // In browser environments, this storage type should never be requested
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
        const { FilesystemStorage } = require('./providers/filesystem')
        return new FilesystemStorage(config)
      } catch (error) {
        throw new Error('FilesystemStorage is not available in this environment. Use \'memory\' or \'s3\' instead.')
      }

    default:
      throw new Error(`Unknown blob storage type: ${(config as any).type}`)
  }
}
