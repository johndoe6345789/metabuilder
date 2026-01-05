import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

export async function blobDelete(key: string): Promise<void> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  await this.blobStorage.delete(key)
}
