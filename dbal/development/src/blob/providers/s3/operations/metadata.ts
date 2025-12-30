import type { BlobMetadata } from '../../../blob-storage'
import { DBALError } from '../../../core/foundation/errors'
import type { S3Context } from '../client'

export async function getMetadata(
  context: S3Context,
  key: string
): Promise<BlobMetadata> {
  try {
    const { HeadObjectCommand } = await import('@aws-sdk/client-s3')

    const command = new HeadObjectCommand({
      Bucket: context.bucket,
      Key: key,
    })

    const response = await context.s3Client.send(command)

    return {
      key,
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      etag: response.ETag || '',
      lastModified: response.LastModified || new Date(),
      customMetadata: response.Metadata,
    }
  } catch (error: unknown) {
    const s3Error = error as { name?: string; message?: string }
    if (s3Error.name === 'NotFound') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    throw DBALError.internal(`S3 head object failed: ${s3Error.message || 'Unknown error'}`)
  }
}

export async function generatePresignedUrl(
  context: S3Context,
  key: string,
  expirationSeconds: number
): Promise<string> {
  try {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

    const command = new GetObjectCommand({
      Bucket: context.bucket,
      Key: key,
    })

    return await getSignedUrl(context.s3Client, command, {
      expiresIn: expirationSeconds,
    })
  } catch (error: unknown) {
    const s3Error = error as { message?: string }
    throw DBALError.internal(`S3 presigned URL generation failed: ${s3Error.message || 'Unknown error'}`)
  }
}
