import type {
  BlobListOptions,
  BlobListResult,
  BlobMetadata,
  BlobStorage,
  DownloadOptions,
  UploadOptions,
} from '../../blob-storage'
import { createMemoryStorageHandlers, MemoryStorageHandlers } from './handlers'

export class MemoryStorage implements BlobStorage {
  private readonly handlers: MemoryStorageHandlers

  constructor() {
    this.handlers = createMemoryStorageHandlers()
  }

  upload(
    key: string,
    data: Buffer | Uint8Array,
    options?: UploadOptions
  ): Promise<BlobMetadata> {
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

  download(key: string, options?: DownloadOptions): Promise<Buffer> {
    return this.handlers.download(key, options)
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

  getMetadata(key: string): Promise<BlobMetadata> {
    return this.handlers.getMetadata(key)
  }

  list(options?: BlobListOptions): Promise<BlobListResult> {
    return this.handlers.list(options)
  }

  generatePresignedUrl(key: string, expirationSeconds?: number): Promise<string> {
    return this.handlers.generatePresignedUrl(key, expirationSeconds)
  }

  copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    return this.handlers.copy(sourceKey, destKey)
  }

  getTotalSize(): Promise<number> {
    return this.handlers.getTotalSize()
  }

  getObjectCount(): Promise<number> {
    return this.handlers.getObjectCount()
  }
}
