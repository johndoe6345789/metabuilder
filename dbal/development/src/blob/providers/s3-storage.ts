import type {
  BlobStorage,
  BlobMetadata,
  BlobListResult,
  UploadOptions,
  DownloadOptions,
  BlobListOptions,
  BlobStorageConfig,
} from '../blob-storage'
import { DBALError } from '../../core/foundation/errors'

/**
 * S3-compatible blob storage implementation
 * Uses AWS SDK v3 for S3 operations
 * Compatible with MinIO and other S3-compatible services
 */
export class S3Storage implements BlobStorage {
  private s3Client: any
  private bucket: string

  constructor(config: BlobStorageConfig) {
    if (!config.s3) {
      throw new Error('S3 configuration required')
    }

    this.bucket = config.s3.bucket

    // Lazy-load AWS SDK to avoid bundling if not used
    this.initializeS3Client(config.s3)
  }

  private async initializeS3Client(s3Config: NonNullable<BlobStorageConfig['s3']>) {
    try {
      // Dynamic import to avoid bundling AWS SDK if not installed
      // @ts-ignore - Optional dependency
      const s3Module = await import('@aws-sdk/client-s3').catch(() => null)
      if (!s3Module) {
        throw new Error('@aws-sdk/client-s3 is not installed. Install it with: npm install @aws-sdk/client-s3')
      }
      const { S3Client } = s3Module
      
      this.s3Client = new S3Client({
        region: s3Config.region,
        credentials: s3Config.accessKeyId && s3Config.secretAccessKey ? {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        } : undefined,
        endpoint: s3Config.endpoint,
        forcePathStyle: s3Config.forcePathStyle,
      })
    } catch (error) {
      throw new Error('AWS SDK @aws-sdk/client-s3 not installed. Install with: npm install @aws-sdk/client-s3')
    }
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    try {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3')
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: options.contentType,
        Metadata: options.metadata,
      })

      const response = await this.s3Client.send(command)

      return {
        key,
        size: data.length,
        contentType: options.contentType || 'application/octet-stream',
        etag: response.ETag || '',
        lastModified: new Date(),
        customMetadata: options.metadata,
      }
    } catch (error: any) {
      if (error.name === 'NoSuchBucket') {
        throw DBALError.notFound(`Bucket not found: ${this.bucket}`)
      }
      throw DBALError.internal(`S3 upload failed: ${error.message}`)
    }
  }

  async uploadStream(
    key: string,
    stream: ReadableStream | NodeJS.ReadableStream,
    size: number,
    options: UploadOptions = {}
  ): Promise<BlobMetadata> {
    try {
      const { Upload } = await import('@aws-sdk/lib-storage')
      
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: stream as any, // Type compatibility between Node.js and Web streams
          ContentType: options.contentType,
          Metadata: options.metadata,
        },
      })

      const response = await upload.done()

      return {
        key,
        size,
        contentType: options.contentType || 'application/octet-stream',
        etag: response.ETag || '',
        lastModified: new Date(),
        customMetadata: options.metadata,
      }
    } catch (error: any) {
      throw DBALError.internal(`S3 stream upload failed: ${error.message}`)
    }
  }

  async download(
    key: string,
    options: DownloadOptions = {}
  ): Promise<Buffer> {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3')
      
      const range = this.buildRangeHeader(options)
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: range,
      })

      const response = await this.s3Client.send(command)

      // Convert stream to buffer
      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as any) {
        chunks.push(chunk)
      }

      return Buffer.concat(chunks)
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      throw DBALError.internal(`S3 download failed: ${error.message}`)
    }
  }

  async downloadStream(
    key: string,
    options: DownloadOptions = {}
  ): Promise<ReadableStream | NodeJS.ReadableStream> {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3')
      
      const range = this.buildRangeHeader(options)
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: range,
      })

      const response = await this.s3Client.send(command)
      return response.Body as any
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      throw DBALError.internal(`S3 download stream failed: ${error.message}`)
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      await this.s3Client.send(command)
      return true
    } catch (error: any) {
      throw DBALError.internal(`S3 delete failed: ${error.message}`)
    }
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
    try {
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3')
      
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      const response = await this.s3Client.send(command)

      return {
        key,
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
        etag: response.ETag || '',
        lastModified: response.LastModified || new Date(),
        customMetadata: response.Metadata,
      }
    } catch (error: any) {
      if (error.name === 'NotFound') {
        throw DBALError.notFound(`Blob not found: ${key}`)
      }
      throw DBALError.internal(`S3 head object failed: ${error.message}`)
    }
  }

  async list(options: BlobListOptions = {}): Promise<BlobListResult> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3')
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: options.prefix,
        ContinuationToken: options.continuationToken,
        MaxKeys: options.maxKeys || 1000,
      })

      const response = await this.s3Client.send(command)

      const items: BlobMetadata[] = (response.Contents || []).map(obj => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        contentType: 'application/octet-stream', // S3 list doesn't return content type
        etag: obj.ETag || '',
        lastModified: obj.LastModified || new Date(),
      }))

      return {
        items,
        nextToken: response.NextContinuationToken,
        isTruncated: response.IsTruncated || false,
      }
    } catch (error: any) {
      throw DBALError.internal(`S3 list failed: ${error.message}`)
    }
  }

  async generatePresignedUrl(
    key: string,
    expirationSeconds: number = 3600
  ): Promise<string> {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3')
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: expirationSeconds,
      })
    } catch (error: any) {
      throw DBALError.internal(`S3 presigned URL generation failed: ${error.message}`)
    }
  }

  async copy(
    sourceKey: string,
    destKey: string
  ): Promise<BlobMetadata> {
    try {
      const { CopyObjectCommand } = await import('@aws-sdk/client-s3')
      
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destKey,
      })

      const response = await this.s3Client.send(command)

      return await this.getMetadata(destKey)
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
      }
      throw DBALError.internal(`S3 copy failed: ${error.message}`)
    }
  }

  async getTotalSize(): Promise<number> {
    // Note: This requires listing all objects and summing sizes
    // For large buckets, this can be expensive
    const result = await this.list({ maxKeys: 1000 })
    let total = result.items.reduce((sum, item) => sum + item.size, 0)

    // Handle pagination if needed
    let nextToken = result.nextToken
    while (nextToken) {
      const pageResult = await this.list({ 
        maxKeys: 1000, 
        continuationToken: nextToken 
      })
      total += pageResult.items.reduce((sum, item) => sum + item.size, 0)
      nextToken = pageResult.nextToken
    }

    return total
  }

  async getObjectCount(): Promise<number> {
    // Similar to getTotalSize, requires listing
    const result = await this.list({ maxKeys: 1000 })
    let count = result.items.length

    let nextToken = result.nextToken
    while (nextToken) {
      const pageResult = await this.list({ 
        maxKeys: 1000, 
        continuationToken: nextToken 
      })
      count += pageResult.items.length
      nextToken = pageResult.nextToken
    }

    return count
  }

  private buildRangeHeader(options: DownloadOptions): string | undefined {
    if (options.offset === undefined && options.length === undefined) {
      return undefined
    }

    const offset = options.offset || 0
    const end = options.length !== undefined ? offset + options.length - 1 : undefined

    return end !== undefined ? `bytes=${offset}-${end}` : `bytes=${offset}-`
  }
}
