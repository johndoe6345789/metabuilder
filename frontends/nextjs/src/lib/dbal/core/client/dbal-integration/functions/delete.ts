import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function blobDeleteDuplicate(this: any, key: string): Promise<void> {
  this.blobs.delete(key)
}
