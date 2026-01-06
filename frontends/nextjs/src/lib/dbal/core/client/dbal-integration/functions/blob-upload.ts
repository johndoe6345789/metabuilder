import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// Blob operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function blobUpload(this: any,
  key: string,
  data: Buffer | Uint8Array,
  metadata?: Record<string, string>
): Promise<void> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  await this.blobStorage.upload(key, data as Buffer, metadata)
}
