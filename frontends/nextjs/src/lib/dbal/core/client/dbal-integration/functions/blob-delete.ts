import { DBALClient, type DBALConfig } from '@/dbal'

export async function blobDelete(key: string): Promise<void> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  await this.blobStorage.delete(key)
}
