import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function blobList(this: any, prefix?: string): Promise<string[]> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  const result = await this.blobStorage.list({ prefix })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.items.map((item: any) => item.key)
}
