import { DBALClient, type DBALConfig } from '@/dbal'

export async function delete(key: string): Promise<void> {
    this.blobs.delete(key)
  }
