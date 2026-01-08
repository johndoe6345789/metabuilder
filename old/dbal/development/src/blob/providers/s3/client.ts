import type { BlobStorageConfig } from '../../blob-storage'

/** S3Client type from @aws-sdk/client-s3 - using interface to avoid requiring the package */
interface S3ClientLike {
  send(command: unknown): Promise<unknown>
  destroy(): void
}

export interface S3Context {
  bucket: string
  s3Client: S3ClientLike
}

export async function createS3Context(config: BlobStorageConfig): Promise<S3Context> {
  if (!config.s3) {
    throw new Error('S3 configuration required')
  }

  const { bucket, ...s3Config } = config.s3

  try {
    // @ts-ignore - optional dependency
    const s3Module = await import('@aws-sdk/client-s3').catch(() => null)
    if (!s3Module) {
      throw new Error('@aws-sdk/client-s3 is not installed. Install it with: npm install @aws-sdk/client-s3')
    }

    const { S3Client } = s3Module
    const s3Client = new S3Client({
      region: s3Config.region,
      credentials: s3Config.accessKeyId && s3Config.secretAccessKey ? {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      } : undefined,
      endpoint: s3Config.endpoint,
      forcePathStyle: s3Config.forcePathStyle,
    })

    return {
      bucket,
      s3Client: s3Client as S3ClientLike,
    }
  } catch (error) {
    throw new Error('AWS SDK @aws-sdk/client-s3 not installed. Install with: npm install @aws-sdk/client-s3')
  }
}
