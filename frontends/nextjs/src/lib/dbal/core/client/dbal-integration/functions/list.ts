import type { DBALClient as _DBALClient, DBALConfig as _DBALConfig } from '@/dbal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function list(this: any, options?: { prefix?: string }): Promise<{ items: { key: string }[] }> {
  const items: { key: string }[] = []
  for (const key of this.blobs.keys()) {
    if (!options?.prefix || key.startsWith(options.prefix)) {
      items.push({ key })
    }
  }
  return { items }
}
