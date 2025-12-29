import { DBALClient, type DBALConfig } from '@/dbal'

export async function upload(key: string, data: Buffer, metadata?: Record<string, string>): Promise<void> {
    this.blobs.set(key, { data, metadata: metadata || {} })
  }
