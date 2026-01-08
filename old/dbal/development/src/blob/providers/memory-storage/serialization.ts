import { createHash } from 'crypto'
import type { UploadOptions, BlobMetadata } from '../../blob-storage'
import type { BlobData } from './store'

export const generateEtag = (data: Buffer): string => `"${createHash('md5').update(data).digest('hex')}"`

export const toBlobData = (data: Buffer, options: UploadOptions = {}): BlobData => ({
  data,
  contentType: options.contentType || 'application/octet-stream',
  etag: generateEtag(data),
  lastModified: new Date(),
  metadata: options.metadata || {},
})

export const toBlobMetadata = (key: string, blob: BlobData): BlobMetadata => ({
  key,
  size: blob.data.length,
  contentType: blob.contentType,
  etag: blob.etag,
  lastModified: blob.lastModified,
  customMetadata: blob.metadata,
})

export const collectStream = async (
  stream: ReadableStream | NodeJS.ReadableStream,
): Promise<Buffer> => {
  const chunks: Buffer[] = []

  if ('getReader' in stream) {
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value))
    }
  } else {
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
  }

  return Buffer.concat(chunks)
}
