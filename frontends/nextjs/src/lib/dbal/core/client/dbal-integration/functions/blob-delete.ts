import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function blobDelete(this: any, key: string): Promise<void> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  await this.blobStorage.delete(key)
}
