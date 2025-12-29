import { DBALClient, type DBALConfig } from '@/dbal'

export async function getMetadata(
  key: string
): Promise<{ customMetadata?: Record<string, string> }> {
  const blob = this.blobs.get(key)
  return { customMetadata: blob?.metadata }
}
