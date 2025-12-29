export interface BlobData {
  data: Buffer
  contentType: string
  etag: string
  lastModified: Date
  metadata: Record<string, string>
}

export type MemoryStore = Map<string, BlobData>

export const createStore = (): MemoryStore => new Map()
