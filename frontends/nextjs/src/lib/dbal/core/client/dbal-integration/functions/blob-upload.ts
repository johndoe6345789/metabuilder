import { DBALClient, type DBALConfig } from '@/dbal'

// Blob operations
export async function blobUpload(
  key: string,
  data: Buffer | Uint8Array,
  metadata?: Record<string, string>
): Promise<void> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  await this.blobStorage.upload(key, data as Buffer, metadata)
}
