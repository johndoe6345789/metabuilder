import type {
  BlobListOptions,
  BlobListResult,
  BlobMetadata,
  BlobStorage,
  DownloadOptions,
  UploadOptions,
} from '../../blob-storage'
import { createTenantAwareHandlers, TenantAwareHandlers } from './handlers'
import type { TenantManager } from '../core/tenant-context'

export class TenantAwareBlobStorage implements BlobStorage {
  private readonly handlers: TenantAwareHandlers

  constructor(
    baseStorage: BlobStorage,
    tenantManager: TenantManager,
    tenantId: string,
    userId: string
  ) {
    this.handlers = createTenantAwareHandlers({
      baseStorage,
      tenantManager,
      tenantId,
      userId,
    })
  }

  upload(key: string, data: Buffer, options?: UploadOptions): Promise<BlobMetadata> {
    return this.handlers.upload(key, data, options)
  }

  uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options?: UploadOptions
  ): Promise<BlobMetadata> {
    return this.handlers.uploadStream(key, stream, size, options)
  }

  download(key: string): Promise<Buffer> {
    return this.handlers.download(key)
  }

  downloadStream(
    key: string,
    options?: DownloadOptions
  ): Promise<ReadableStream | NodeJS.ReadableStream> {
    return this.handlers.downloadStream(key, options)
  }

  delete(key: string): Promise<boolean> {
    return this.handlers.deleteBlob(key)
  }

  exists(key: string): Promise<boolean> {
    return this.handlers.exists(key)
  }

  copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    return this.handlers.copy(sourceKey, destKey)
  }

  list(options?: BlobListOptions): Promise<BlobListResult> {
    return this.handlers.list(options)
  }

  getMetadata(key: string): Promise<BlobMetadata> {
    return this.handlers.getMetadata(key)
  }

  getStats(): Promise<{ count: number; totalSize: number }> {
    return this.handlers.getStats()
  }

  generatePresignedUrl(key: string, expiresIn: number): Promise<string> {
    return this.handlers.generatePresignedUrl(key, expiresIn)
  }

  getTotalSize(): Promise<number> {
    return this.handlers.getTotalSize()
  }

  getObjectCount(): Promise<number> {
    return this.handlers.getObjectCount()
  }
}
