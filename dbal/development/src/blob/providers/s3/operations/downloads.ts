import type { DownloadOptions } from '../../../blob-storage'
import { DBALError } from '../../../../../core/foundation/errors'
import { buildRangeHeader } from '../range'
import type { S3Context } from '../client'

export async function downloadBuffer(
  context: S3Context,
  key: string,
  options: DownloadOptions
): Promise<Buffer> {
  try {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')

    const command = new GetObjectCommand({
      Bucket: context.bucket,
      Key: key,
      Range: buildRangeHeader(options),
    })

    const response = await context.s3Client.send(command)

    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  } catch (error) {
    const s3Error = error as { name?: string; message?: string }
    if (s3Error.name === 'NoSuchKey') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    throw DBALError.internal(`S3 download failed: ${s3Error.message}`)
  }
}

export async function downloadStream(
  context: S3Context,
  key: string,
  options: DownloadOptions
): Promise<ReadableStream | NodeJS.ReadableStream> {
  try {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')

    const command = new GetObjectCommand({
      Bucket: context.bucket,
      Key: key,
      Range: buildRangeHeader(options),
    })

    const response = await context.s3Client.send(command) as { Body: ReadableStream | NodeJS.ReadableStream }
    return response.Body
  } catch (error) {
    const s3Error = error as { name?: string; message?: string }
    if (s3Error.name === 'NoSuchKey') {
      throw DBALError.notFound(`Blob not found: ${key}`)
    }
    throw DBALError.internal(`S3 download stream failed: ${s3Error.message}`)
  }
}
