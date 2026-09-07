import { readList } from '@/lib/db/read-list'
import { dbalFetch, unwrap } from '../dbal-fetch'
import type { ListOptions, ListResult } from '../types'

function buildQuery(options?: ListOptions): string {
  const params = new URLSearchParams()
  if (options?.filter != null) {
    for (const [k, v] of Object.entries(options.filter)) {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        params.set(`filter.${k}`, String(v))
      }
    }
  }
  // `limit` and `offset`, not `_limit`/`_offset`: DBAL's list handler
  // reads the former and silently drops anything it does not recognise,
  // so every list through this client came back at its default of twenty
  // rows -- while `total` below reports rows.length, leaving the caller no
  // way to tell it had been cut off. The rest of the app already spells
  // them this way.
  if (options?.limit !== undefined) params.set('limit', String(options.limit))
  if (options?.offset !== undefined) {
    params.set('offset', String(options.offset))
  }
  return params.toString()
}

export async function listEntity(
  base: string,
  options?: ListOptions
): Promise<ListResult> {
  const qs = buildQuery(options)
  const url = qs.length > 0 ? `${base}?${qs}` : base

  try {
    const raw = await dbalFetch<unknown>(url)
    const rows = readList<Record<string, unknown>>(raw)
    const payload = unwrap<Record<string, unknown>>(raw)
    // unwrap<T>() casts rather than validates -- `payload`'s declared type
    // is a lie about what an arbitrary DBAL JSON response actually is.
    const total =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      payload !== null && typeof payload === 'object'
        ? (payload as { total?: number }).total
        : undefined

    return { data: rows, total: total ?? rows.length }
  } catch {
    // Still an empty list, so readers that only want rows are unaffected --
    // but flagged, so a guard can tell "nothing is there" from "I could
    // not look". See ListResult.failed.
    return { data: [], failed: true }
  }
}
