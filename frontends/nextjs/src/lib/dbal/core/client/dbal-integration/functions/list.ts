import { DBALClient, type DBALConfig } from '@/dbal'

export async function list(options?: { prefix?: string }): Promise<{ items: { key: string }[] }> {
  const items: { key: string }[] = []
  for (const key of this.blobs.keys()) {
    if (!options?.prefix || key.startsWith(options.prefix)) {
      items.push({ key })
    }
  }
  return { items }
}
