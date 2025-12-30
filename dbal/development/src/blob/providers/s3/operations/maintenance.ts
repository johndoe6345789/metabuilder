import type { BlobMetadata } from '../../../blob-storage'
import { DBALError } from '@/core/foundation/errors'
import type { S3Context } from '../client'
import { getMetadata } from './metadata'

export async function deleteObject(
  context: S3Context,
  key: string
): Promise<boolean> {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')

    const command = new DeleteObjectCommand({
      Bucket: context.bucket,
      Key: key,
    })

    await context.s3Client.send(command)
    return true
  } catch (error: unknown) {
    const s3Error = error as { message?: string }
    throw DBALError.internal(`S3 delete failed: ${s3Error.message || 'Unknown error'}`)
  }
}

export async function copyObject(
  context: S3Context,
  sourceKey: string,
  destKey: string
): Promise<BlobMetadata> {
  try {
    const { CopyObjectCommand } = await import('@aws-sdk/client-s3')

    const command = new CopyObjectCommand({
      Bucket: context.bucket,
      CopySource: `${context.bucket}/${sourceKey}`,
      Key: destKey,
    })

    await context.s3Client.send(command)

    return await getMetadata(context, destKey)
  } catch (error: unknown) {
    const s3Error = error as { name?: string; message?: string }
    if (s3Error.name === 'NoSuchKey') {
      throw DBALError.notFound(`Source blob not found: ${sourceKey}`)
    }
    throw DBALError.internal(`S3 copy failed: ${s3Error.message || 'Unknown error'}`)
  }
}
