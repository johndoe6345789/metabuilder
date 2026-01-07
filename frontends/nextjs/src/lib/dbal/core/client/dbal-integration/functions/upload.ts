import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

 
export async function upload(this: any,
  key: string,
  data: Buffer,
  metadata?: Record<string, string>
): Promise<void> {
  this.blobs.set(key, { data, metadata: metadata || {} })
}
