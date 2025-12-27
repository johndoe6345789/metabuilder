import type { BlobMetadata } from '../../blob-storage'

export const withUnscopedMetadata = (
  metadata: BlobMetadata,
  key: string
): BlobMetadata => ({
  ...metadata,
  key,
})
