import type {
  BlobStorage,
  BlobMetadata,
  BlobListResult,
  UploadOptions,
  DownloadOptions,
  BlobListOptions,
  BlobStorageConfig,
} from '../../blob-storage'
import { DBALError } from '../../../core/foundation/errors'
import type { S3Context } from './client'
import { createS3Context } from './client'
import { downloadBuffer, downloadStream } from './operations/downloads'
import { listBlobs, sumSizes, countObjects } from './operations/listing'
import { getMetadata, generatePresignedUrl } from './operations/metadata'
import { uploadBuffer, uploadStream } from './operations/uploads'
import { copyObject, deleteObject } from './operations/maintenance'

export class S3Storage implements BlobStorage {
  private contextPromise: Promise<S3Context>

  constructor(config: BlobStorageConfig) {
    this.contextPromise = createS3Context(config)
  }

  private async context(): Promise<S3Context> {
    return this.contextPromise
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    const context = await this.context()
    return uploadBuffer(context, key, data, options)
  }

  async uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    const context = await this.context()
    return uploadStream(context, key, stream, size, options)
  }

  async download(
    key: string,
    options: DownloadOptions = {}
  ): Promise<Buffer> {
    const context = await this.context()
    return downloadBuffer(context, key, options)
  }

  async downloadStream(
    key: string,
    options: DownloadOptions = {}
  ): Promise<ReadableStream | NodeJS.ReadableStream> {
    const context = await this.context()
    return downloadStream(context, key, options)
  }

  async delete(key: string): Promise<boolean> {
    const context = await this.context()
    return deleteObject(context, key)
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.getMetadata(key)
      return true
    } catch (error) {
      if (error instanceof DBALError && error.code === 404) {
        return false
      }
      throw error
    }
  }

  async getMetadata(key: string): Promise<BlobMetadata> {
    const context = await this.context()
    return getMetadata(context, key)
  }

  async list(options: BlobListOptions = {}): Promise<BlobListResult> {
    const context = await this.context()
    return listBlobs(context, options)
  }

  async generatePresignedUrl(
    key: string,
    expirationSeconds: number = 3600
  ): Promise<string> {
    const context = await this.context()
    return generatePresignedUrl(context, key, expirationSeconds)
  }

  async copy(sourceKey: string, destKey: string): Promise<BlobMetadata> {
    const context = await this.context()
    return copyObject(context, sourceKey, destKey)
  }

  async getTotalSize(): Promise<number> {
    const context = await this.context()
    return sumSizes(context)
  }

  async getObjectCount(): Promise<number> {
    const context = await this.context()
    return countObjects(context)
  }
}
