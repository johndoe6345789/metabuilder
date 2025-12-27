import type { BlobMetadata } from '../blob-storage'
import { createHash } from 'crypto'

export interface BlobData {
  data: Buffer
  contentType: string
  etag: string
  lastModified: Date
  metadata: Record<string, string>
}

export type MemoryStore = Map<string, BlobData>

export const createStore = (): MemoryStore => new Map()

export const generateEtag = (data: Buffer): string => `"${createHash('md5').update(data).digest('hex')}"`

export const makeBlobMetadata = (key: string, blob: BlobData): BlobMetadata => ({
  key,
  size: blob.data.length,
  contentType: blob.contentType,
  etag: blob.etag,
  lastModified: blob.lastModified,
  customMetadata: blob.metadata,
})
