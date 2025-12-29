/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '@/dbal/development/src/blob/tenant-aware-storage' {
  import type { BlobListResult,BlobMetadata, BlobStorage } from '@/dbal/development/src/blob'
  import type { InMemoryTenantManager } from '@/dbal/development/src/core/tenant-context'

  export class TenantAwareBlobStorage implements BlobStorage {
    constructor(storage: BlobStorage, tenantManager: InMemoryTenantManager, ...args: any[])
    upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string>
    download(key: string): Promise<Buffer>
    delete(key: string): Promise<void>
    exists(key: string): Promise<boolean>
    list(options?: { prefix?: string }): Promise<BlobListResult>
    getMetadata(key: string): Promise<BlobMetadata | null>
  }
}
