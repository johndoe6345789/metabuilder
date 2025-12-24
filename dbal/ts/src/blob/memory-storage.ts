import type {
  BlobStorage,
  BlobMetadata,
  BlobListResult,
  UploadOptions,
  DownloadOptions,
  ListOptions,
} from './blob-storage'
import { DBALError } from '../core/errors'
import { createHash } from 'crypto'

interface BlobData {
  data: Buffer
  contentType: string
  etag: string
  lastModified: Date
  metadata: Record<string, string>
}

/**
 * In-memory blob storage implementation
 * Useful for testing and development
 */
export class MemoryStorage implements BlobStorage {
  private store: Map<string, BlobData> = new Map()

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    const buffer = Buffer.from(data)

    if (!options.overwrite && this.store.has(key)) {
      throw DBALError.conflict(`Blob already exists: ${key}`)
    }

    const blob: BlobData = {
      data: buffer,
      contentType: options.contentType || 'application/octet-stream',
      etag: this.generateEtag(buffer),
      lastModified: new Date(),
      metadata: options.metadata || {},
    }

    this.store.set(key, blob)

    return this.makeBlobMetadata(key, blob)
  }

  async uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    // Collect stream data into buffer
    const chunks: Buffer[] = []

    if ('getReader' in stream) {
      // Web ReadableStream
      const reader = stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(Buffer.from(value))
      }
    } else {
      // Node.js ReadableStream
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk))
      }
    }

    const buffer = Buffer.concat(chunks)
    return this.upload(key, buffer, options)
  }

  async download(
    key: string,
    options: DownloadOptions = {}
  ): Promise<Buffer> {
    const blob = this.store.get(key)

    if (!blob) {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }

    let data = blob.data

    if (options.offset !== undefined || options.length !== undefined) {
      const offset = options.offset || 0
      const length = options.length || (data.length - offset)

      if (offset >= data.length) {
        throw DBALError.validationError('Offset exceeds blob size')
      }

      data = data.subarray(offset, offset + length)
    }

    return data
  }

  async downloadStream(
    key: string,
    options: DownloadOptions = {}
  ): Promise<ReadableStream | NodeJS.ReadableStream> {
    const data = await this.download(key, options)

    // Return a readable stream
    if (typeof ReadableStream !== 'undefined') {
      // Web ReadableStream
      return new ReadableStream({
        start(controller) {
          controller.enqueue(data)
          controller.close()
        },
      })
    } else {
      // Node.js ReadableStream
      const { Readable } = await import('stream')
      return Readable.from(data)
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.store.has(key)) {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }

    this.store.delete(key)
    return true
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key)
  }

  async getMetadata(key: string): Promise<BlobMetadata> {
    const blob = this.store.get(key)

    if (!blob) {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }

    return this.makeBlobMetadata(key, blob)
  }

  async list(options: ListOptions = {}): Promise<BlobListResult> {
    const prefix = options.prefix || ''
    const maxKeys = options.maxKeys || 1000

    const items: BlobMetadata[] = []
    let nextToken: string | undefined

    for (const [key, blob] of this.store.entries()) {
      if (!prefix || key.startsWith(prefix)) {
        if (items.length >= maxKeys) {
          nextToken = key
          break
        }
        items.push(this.makeBlobMetadata(key, blob))
      }
    }

    return {
      items,
      nextToken,
      isTruncated: nextToken !== undefined,
    }
  }

  async generatePresignedUrl(
    key: string,
    expirationSeconds: number = 3600
  ): Promise<string> {
    // Memory storage doesn't support presigned URLs
    return ''
  }

  async copy(
    sourceKey: string,
    destKey: string
  ): Promise<BlobMetadata> {
    const sourceBlob = this.store.get(sourceKey)

    if (!sourceBlob) {
      throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
    }

    const destBlob: BlobData = {
      ...sourceBlob,
      data: Buffer.from(sourceBlob.data),
      lastModified: new Date(),
    }

    this.store.set(destKey, destBlob)

    return this.makeBlobMetadata(destKey, destBlob)
  }

  async getTotalSize(): Promise<number> {
    let total = 0
    for (const blob of this.store.values()) {
      total += blob.data.length
    }
    return total
  }

  async getObjectCount(): Promise<number> {
    return this.store.size
  }

  private generateEtag(data: Buffer): string {
    const hash = createHash('md5').update(data).digest('hex')
    return `"${hash}"`
  }

  private makeBlobMetadata(key: string, blob: BlobData): BlobMetadata {
    return {
      key,
      size: blob.data.length,
      contentType: blob.contentType,
      etag: blob.etag,
      lastModified: blob.lastModified,
      customMetadata: blob.metadata,
    }
  }
}
