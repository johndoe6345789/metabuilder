import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

 
export async function blobDownload(this: any, key: string): Promise<Buffer> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  return this.blobStorage.download(key)
}
