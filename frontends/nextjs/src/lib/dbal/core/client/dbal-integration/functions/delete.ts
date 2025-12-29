import { DBALClient, type DBALConfig } from '@/dbal'

export async function blobDeleteDuplicate(key: string): Promise<void> {
    this.blobs.delete(key)
  }
