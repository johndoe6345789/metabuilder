declare module '@/dbal/development/src/blob' {
  export interface BlobStorageConfig {
    type: 'filesystem' | 'memory' | 's3'
    basePath?: string
  }

  export interface BlobMetadata {
    contentType?: string
    size?: number
    lastModified?: Date
    [key: string]: unknown
  }

  export interface BlobListItem {
    key: string
    [key: string]: unknown
  }

  export interface BlobListResult {
    items: BlobListItem[]
    [key: string]: unknown
  }

  export interface BlobStorage {
    upload(key: string, data: Buffer | string, metadata?: BlobMetadata): Promise<string>
    download(key: string): Promise<Buffer>
    delete(key: string): Promise<void>
    exists(key: string): Promise<boolean>
    list(options?: { prefix?: string }): Promise<BlobListResult>
    getMetadata(key: string): Promise<BlobMetadata | null>
  }

  export function createBlobStorage(config: BlobStorageConfig): BlobStorage
}
