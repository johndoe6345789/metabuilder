import type { BlobListOptions, BlobListResult, BlobMetadata, BlobStorage, DownloadOptions, UploadOptions } from '../blob-storage'
import type { TenantManager } from '../../core/foundation/tenant-context'
import type { TenantAwareDeps } from './context'
import { deleteBlob, exists, copyBlob, getStats } from './mutations'
import { downloadBuffer, downloadStream, generatePresignedUrl, getMetadata, listBlobs } from './reads'
import { uploadBuffer, uploadStream } from './uploads'

export class TenantAwareBlobStorage implements BlobStorage {
  private readonly deps: TenantAwareDeps

  constructor(baseStorage: BlobStorage, tenantManager: TenantManager, tenantId: string, userId: string) {
    this.deps = { baseStorage, tenantManager, tenantId, userId }
  }

  async upload(key: string, data: Buffer, options?: UploadOptions): Promise<BlobMetadata> {
    return uploadBuffer(this.deps, key, data, options)
  }

  async uploadStream(key: string, stream: NodeJS.ReadableStream, size: number, options?: UploadOptions): Promise<BlobMetadata> {
    return uploadStream(this.deps, key, stream, size, options)
  }

  async download(key: string): Promise<Buffer> {
    return downloadBuffer(this.deps, key)
  }

  async downloadStream(key: string, options?: DownloadOptions): Promise<ReadableStream | NodeJS.ReadableStream> {
    return downloadStream(this.deps, key, options)
  }

  async delete(key: string): Promise<boolean> {
    return deleteBlob(this.deps, key)
  }

  async exists(key: string): Promise<boolean> {
    return exists(this.deps, key)
  }

  async copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    return copyBlob(this.deps, sourceKey, destKey)
  }

  async list(options?: BlobListOptions): Promise<BlobListResult> {
    return listBlobs(this.deps, options)
  }

  async getMetadata(key: string): Promise<BlobMetadata> {
    return getMetadata(this.deps, key)
  }

  async getStats(): Promise<{ count: number; totalSize: number }> {
    return getStats(this.deps)
  }

  async generatePresignedUrl(key: string, expiresIn: number): Promise<string> {
    return generatePresignedUrl(this.deps, key, expiresIn)
  }

  async getTotalSize(): Promise<number> {
    return this.deps.baseStorage.getTotalSize()
  }

  async getObjectCount(): Promise<number> {
    return this.deps.baseStorage.getObjectCount()
  }
}
