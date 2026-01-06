import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMetadata(this: any,
  key: string
): Promise<{ customMetadata?: Record<string, string> }> {
  const blob = this.blobs.get(key)
  return { customMetadata: blob?.metadata }
}
