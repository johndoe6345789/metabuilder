/**
 * DBAL Blob Storage Stub
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
 

export interface BlobStorageConfig {
  type: 'filesystem' | 'memory' | 's3'
  basePath?: string
}

export interface BlobMetadata {
  contentType?: string
  size?: number
  lastModified?: Date
  [key: string]: any
}

export interface BlobListItem {
  key: string
  [key: string]: any
}

export interface BlobListResult {
  items: BlobListItem[]
}

export interface BlobStorage {
  upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  list(options?: { prefix?: string }): Promise<BlobListResult>
  getMetadata(key: string): Promise<BlobMetadata | null>
}

class InMemoryBlobStorage implements BlobStorage {
  private store = new Map<string, { data: Buffer; metadata: BlobMetadata }>()

  async upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string> {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data
    this.store.set(key, {
      data: buffer,
      metadata: { ...metadata, size: buffer.length, lastModified: new Date() },
    })
    return key
  }

  async download(key: string): Promise<Buffer> {
    const item = this.store.get(key)
    if (!item) throw new Error(`Blob not found: ${key}`)
    return item.data
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key)
  }

  async list(options?: { prefix?: string }): Promise<BlobListResult> {
    const items: BlobListItem[] = []
    for (const key of this.store.keys()) {
      if (!options?.prefix || key.startsWith(options.prefix)) {
        items.push({ key })
      }
    }
    return { items }
  }

  async getMetadata(key: string): Promise<BlobMetadata | null> {
    const item = this.store.get(key)
    return item?.metadata ?? null
  }
}

export function createBlobStorage(_config: BlobStorageConfig): BlobStorage {
  return new InMemoryBlobStorage()
}
