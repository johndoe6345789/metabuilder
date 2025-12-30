import { promises as fs } from 'fs'
import type {
  BlobStorage,
  BlobMetadata,
  BlobListResult,
  UploadOptions,
  DownloadOptions,
  BlobListOptions,
  BlobStorageConfig,
} from '../../blob-storage'
import { createFilesystemContext, type FilesystemContext } from './context'
import { buildFullPath } from './paths'
import { copyBlob, deleteBlob, objectCount, totalSize } from './operations/maintenance'
import { downloadBuffer, downloadStream } from './operations/downloads'
import { readMetadata } from './operations/metadata'
import { listBlobs } from './operations/listing'
import { uploadBuffer, uploadStream } from './operations/uploads'

export class FilesystemStorage implements BlobStorage {
  private readonly context: FilesystemContext

  constructor(config: BlobStorageConfig) {
    this.context = createFilesystemContext(config)
  }

  upload(
    key: string,
    data: Buffer | Uint8Array,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    return uploadBuffer(this.context, key, data, options)
  }

  uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    return uploadStream(this.context, key, stream, size, options)
  }

  download(
    key: string,
    options: DownloadOptions = {}
  ): Promise<Buffer> {
    return downloadBuffer(this.context, key, options)
  }

  downloadStream(
    key: string,
    options: DownloadOptions = {}
  ): Promise<NodeJS.ReadableStream> {
    return downloadStream(this.context, key, options)
  }

  delete(key: string): Promise<boolean> {
    return deleteBlob(this.context, key)
  }

  async exists(key: string): Promise<boolean> {
    const filePath = buildFullPath(this.context.basePath, key)

    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  getMetadata(key: string): Promise<BlobMetadata> {
    return readMetadata(this.context, key)
  }

  list(options: BlobListOptions = {}): Promise<BlobListResult> {
    return listBlobs(this.context, options)
  }

  async generatePresignedUrl(
    key: string,
    expirationSeconds: number = 3600
  ): Promise<string> {
    return ''
  }

  copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    return copyBlob(this.context, sourceKey, destKey)
  }

  getTotalSize(): Promise<number> {
    return totalSize(this.context)
  }

  getObjectCount(): Promise<number> {
    return objectCount(this.context)
  }
}
