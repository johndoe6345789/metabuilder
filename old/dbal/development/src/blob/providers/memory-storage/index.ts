import type {
  BlobStorage,
  BlobMetadata,
  BlobListResult,
  UploadOptions,
  DownloadOptions,
  BlobListOptions,
} from '../../blob-storage'
import { createStore } from './store'
import { uploadBuffer, uploadFromStream } from './uploads'
import { downloadBuffer, downloadStream } from './downloads'
import { copyBlob, deleteBlob, getMetadata, listBlobs, getObjectCount, getTotalSize } from './management'
import { normalizeKey } from './utils'

export class MemoryStorage implements BlobStorage {
  private store = createStore()

  async upload(key: string, data: Buffer | Uint8Array, options: UploadOptions = {}): Promise<BlobMetadata> {
    return uploadBuffer(this.store, key, data, options)
  }

  async uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    _size: number,
    options: UploadOptions = {},
  ): Promise<BlobMetadata> {
    return uploadFromStream(this.store, key, stream, options)
  }

  async download(key: string, options: DownloadOptions = {}): Promise<Buffer> {
    return downloadBuffer(this.store, key, options)
  }

  async downloadStream(
    key: string,
    options: DownloadOptions = {},
  ): Promise<ReadableStream | NodeJS.ReadableStream> {
    return downloadStream(this.store, key, options)
  }

  async delete(key: string): Promise<boolean> {
    return deleteBlob(this.store, key)
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(normalizeKey(key))
  }

  async getMetadata(key: string): Promise<BlobMetadata> {
    return getMetadata(this.store, key)
  }

  async list(options: BlobListOptions = {}): Promise<BlobListResult> {
    return listBlobs(this.store, options)
  }

  async generatePresignedUrl(_key: string, _expirationSeconds: number = 3600): Promise<string> {
    return ''
  }

  async copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    return copyBlob(this.store, sourceKey, destKey)
  }

  async getTotalSize(): Promise<number> {
    return getTotalSize(this.store)
  }

  async getObjectCount(): Promise<number> {
    return getObjectCount(this.store)
  }
}
