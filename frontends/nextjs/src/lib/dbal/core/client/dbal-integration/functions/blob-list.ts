import { DBALClient, type DBALConfig } from '@/dbal'

export async function blobList(prefix?: string): Promise<string[]> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    const result = await this.blobStorage.list({ prefix })
    return result.items.map(item => item.key)
  }
