import { createHash } from 'crypto'
import type { BlobMetadata, UploadOptions } from '../../blob-storage'

export interface BlobData {
  data: Buffer
  contentType: string
  etag: string
  lastModified: Date
  metadata: Record<string, string>
}

export const createBlobData = (
  buffer: Buffer,
  options: UploadOptions
): BlobData => ({
  data: buffer,
  contentType: options.contentType || 'application/octet-stream',
  etag: generateEtag(buffer),
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

const generateEtag = (data: Buffer): string => {
  const hash = createHash('md5').update(data).digest('hex')
  return `"${hash}"`
}
