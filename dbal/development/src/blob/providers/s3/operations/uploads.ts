import type { BlobMetadata, UploadOptions } from '../../../blob-storage'
import { DBALError } from '../../../../core/foundation/errors'
import type { S3Context } from '../client'

export async function uploadBuffer(
  context: S3Context,
  key: string,
  data: Buffer | Uint8Array,
  options: UploadOptions
): Promise<BlobMetadata> {
  try {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')

    const command = new PutObjectCommand({
      Bucket: context.bucket,
      Key: key,
      Body: data,
      ContentType: options.contentType,
      Metadata: options.metadata,
    })

    const response = await context.s3Client.send(command) as {
      ETag?: string
    }

    return {
      key,
      size: data.length,
      contentType: options.contentType || 'application/octet-stream',
      etag: response.ETag || '',
      lastModified: new Date(),
      customMetadata: options.metadata,
    }
  } catch (error: unknown) {
    const s3Error = error as { name?: string; message?: string }
    if (s3Error.name === 'NoSuchBucket') {
      throw DBALError.notFound(`Bucket not found: ${context.bucket}`)
    }
    throw DBALError.internal(`S3 upload failed: ${s3Error.message || 'Unknown error'}`)
  }
}

export async function uploadStream(
  context: S3Context,
  key: string,
  stream: ReadableStream | NodeJS.ReadableStream,
  size: number,
  options: UploadOptions
): Promise<BlobMetadata> {
  try {
    const { Upload } = await import('@aws-sdk/lib-storage')

    const upload = new Upload({
      client: context.s3Client,
      params: {
        Bucket: context.bucket,
        Key: key,
        Body: stream as any,
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
  } catch (error: unknown) {
    const s3Error = error as { message?: string }
    throw DBALError.internal(`S3 stream upload failed: ${s3Error.message || 'Unknown error'}`)
  }
}
