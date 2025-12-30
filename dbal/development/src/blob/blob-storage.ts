/**
 * Blob Storage Interface for DBAL
 * Supports S3, filesystem, and in-memory implementations
 */

export interface BlobMetadata {
  key: string
  size: number
  contentType: string
  etag: string
  lastModified: Date
  customMetadata?: Record<string, string> | undefined
}

export interface BlobListResult {
  items: BlobMetadata[]
  nextToken?: string | undefined
  isTruncated: boolean
}

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  overwrite?: boolean
}

export interface DownloadOptions {
  offset?: number
  length?: number
}

export interface BlobListOptions {
  prefix?: string
  continuationToken?: string
  maxKeys?: number
}

export interface BlobStorageConfig {
  type: 's3' | 'filesystem' | 'memory'
  
  // S3 configuration
  s3?: {
    bucket: string
    region: string
    accessKeyId?: string
    secretAccessKey?: string
    endpoint?: string // For MinIO compatibility
    forcePathStyle?: boolean
  }
  
  // Filesystem configuration
  filesystem?: {
    basePath: string
    createIfNotExists?: boolean
  }
}

/**
 * Abstract blob storage interface
 */
export interface BlobStorage {
  /**
   * Upload data to blob storage
   */
  upload(
    key: string,
    data: Buffer | Uint8Array,
    options?: UploadOptions
  ): Promise<BlobMetadata>

  /**
   * Upload from stream (for large files)
   */
  uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options?: UploadOptions
  ): Promise<BlobMetadata>

  /**
   * Download data from blob storage
   */
  download(
    key: string,
    options?: DownloadOptions
  ): Promise<Buffer>

  /**
   * Download to stream (for large files)
   */
  downloadStream(
    key: string,
    options?: DownloadOptions
  ): Promise<ReadableStream | NodeJS.ReadableStream>

  /**
   * Delete a blob
   */
  delete(key: string): Promise<boolean>

  /**
   * Check if blob exists
   */
  exists(key: string): Promise<boolean>

  /**
   * Get blob metadata without downloading content
   */
  getMetadata(key: string): Promise<BlobMetadata>

  /**
   * List blobs with optional prefix filter
   */
  list(options?: BlobListOptions): Promise<BlobListResult>

  /**
   * Generate presigned URL for temporary access (S3 only)
   * Returns empty string for non-S3 implementations
   */
  generatePresignedUrl(
    key: string,
    expirationSeconds?: number
  ): Promise<string>

  /**
   * Copy blob to another location
   */
  copy(
    sourceKey: string,
    destKey: string
  ): Promise<BlobMetadata>

  /**
   * Get storage statistics
   */
  getTotalSize(): Promise<number>
  getObjectCount(): Promise<number>
}
