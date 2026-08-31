import { readList } from '@/lib/db/read-list'
import { dbalFetch, unwrap } from '../dbal-fetch'
import type { ListOptions, ListResult } from '../types'

function buildQuery(options?: ListOptions): string {
  const params = new URLSearchParams()
  if (options?.filter != null) {
    for (const [k, v] of Object.entries(options.filter)) {
      if (v !== undefined && v !== null) {
        params.set(`filter.${k}`, String(v as string | number | boolean))
      }
    }
  }
  if (options?.limit !== undefined) params.set('_limit', String(options.limit))
  if (options?.offset !== undefined) {
    params.set('_offset', String(options.offset))
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
    const total =
      payload !== null && typeof payload === 'object'
        ? (payload as { total?: number }).total
        : undefined

    return { data: rows, total: total ?? rows.length }
  } catch {
    return { data: [] }
  }
}
