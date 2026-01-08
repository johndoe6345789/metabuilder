import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

 
export async function blobList(this: any, prefix?: string): Promise<string[]> {
  if (!this.blobStorage) throw new Error('DBAL not initialized')
  const result = await this.blobStorage.list({ prefix })
   
  return result.items.map((item: any) => item.key)
}
