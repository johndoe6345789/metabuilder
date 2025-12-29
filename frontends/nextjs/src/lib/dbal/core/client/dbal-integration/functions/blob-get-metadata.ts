import { DBALClient, type DBALConfig } from '@/dbal'

export async function blobGetMetadata(key: string): Promise<Record<string, string>> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  const metadata = await this.blobStorage.getMetadata(key)
  return metadata.customMetadata || {}
}
