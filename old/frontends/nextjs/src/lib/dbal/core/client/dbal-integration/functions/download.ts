import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

 
export async function download(this: any, key: string): Promise<Buffer> {
  const blob = this.blobs.get(key)
  if (!blob) throw new Error(`Blob not found: ${key}`)
  return blob.data
}
