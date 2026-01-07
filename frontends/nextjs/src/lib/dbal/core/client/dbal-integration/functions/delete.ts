import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

 
export async function blobDeleteDuplicate(this: any, key: string): Promise<void> {
  this.blobs.delete(key)
}
