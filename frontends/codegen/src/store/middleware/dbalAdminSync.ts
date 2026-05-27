/**
 * DBAL admin bulk sync and fetch operations.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENTITY_MAP } from './dbalConfig'
import { syncToDBAL, listFromDBAL } from './dbalCrud'

export async function syncAllToDBAL(
  data: Record<string, any[]>,
): Promise<{ synced: number; failed: number }> {
  let synced = 0
  let failed = 0
  for (const [sliceName, records] of Object.entries(data)) {
    if (!ENTITY_MAP[sliceName]) continue
    for (const record of records) {
      try {
        const id = (record as any).id
        if (!id) continue
        await syncToDBAL(sliceName, id, record)
        synced++
      } catch {
        failed++
      }
    }
  }
  return { synced, failed }
}

export async function fetchAllFromDBAL(): Promise<
  Record<string, any[]>
> {
  const result: Record<string, any[]> = {}
  const entries = Object.entries(ENTITY_MAP)
  const settled = await Promise.allSettled(
    entries.map(([sliceName]) => listFromDBAL(sliceName)),
  )
  for (let i = 0; i < entries.length; i++) {
    const [sliceName] = entries[i]
    const outcome = settled[i]
    result[sliceName] =
      outcome.status === 'fulfilled' ? outcome.value : []
  }
  return result
}
