import type { BlobListOptions, BlobListResult, BlobMetadata } from '../../../blob-storage'
import { DBALError } from '@/core/foundation/errors'
import type { S3Context } from '../client'

export async function listBlobs(
  context: S3Context,
  options: BlobListOptions
): Promise<BlobListResult> {
  try {
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3')

    const command = new ListObjectsV2Command({
      Bucket: context.bucket,
      Prefix: options.prefix,
      ContinuationToken: options.continuationToken,
      MaxKeys: options.maxKeys || 1000,
    })

    const response = await context.s3Client.send(command)

    const items: BlobMetadata[] = (response.Contents || []).map(obj => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      contentType: 'application/octet-stream',
      etag: obj.ETag || '',
      lastModified: obj.LastModified || new Date(),
    }))

    return {
      items,
      nextToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
    }
  } catch (error) {
    const s3Error = error as Error
    throw DBALError.internal(`S3 list failed: ${s3Error.message}`)
  }
}

export async function sumSizes(context: S3Context): Promise<number> {
  const result = await listBlobs(context, { maxKeys: 1000 })
  let total = result.items.reduce((sum, item) => sum + item.size, 0)

  let nextToken = result.nextToken
  while (nextToken) {
    const pageResult = await listBlobs(context, {
      maxKeys: 1000,
      continuationToken: nextToken
    })
    total += pageResult.items.reduce((sum, item) => sum + item.size, 0)
    nextToken = pageResult.nextToken
  }

  return total
}

export async function countObjects(context: S3Context): Promise<number> {
  const result = await listBlobs(context, { maxKeys: 1000 })
  let count = result.items.length

  let nextToken = result.nextToken
  while (nextToken) {
    const pageResult = await listBlobs(context, {
      maxKeys: 1000,
      continuationToken: nextToken
    })
    count += pageResult.items.length
    nextToken = pageResult.nextToken
  }

  return count
}
