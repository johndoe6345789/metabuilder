import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function blobGetMetadata(this: any, key: string): Promise<Record<string, string>> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  const metadata = await this.blobStorage.getMetadata(key)
  return metadata.customMetadata || {}
}
