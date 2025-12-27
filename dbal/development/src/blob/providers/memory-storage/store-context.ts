import type { BlobData } from './blob-data'

export interface MemoryStoreContext {
  store: Map<string, BlobData>
}

export const createMemoryStoreContext = (): MemoryStoreContext => ({
  store: new Map<string, BlobData>(),
})
