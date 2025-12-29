import { DBALClient, type DBALConfig } from '@/dbal'

export async function blobDownload(key: string): Promise<Buffer> {
    if (!this.blobStorage) throw new Error('DBAL not initialized')
    return this.blobStorage.download(key)
  }
