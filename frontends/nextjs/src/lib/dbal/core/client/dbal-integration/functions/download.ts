import { DBALClient, type DBALConfig } from '@/dbal'

export async function download(key: string): Promise<Buffer> {
    const blob = this.blobs.get(key)
    if (!blob) throw new Error(`Blob not found: ${key}`)
    return blob.data
  }
