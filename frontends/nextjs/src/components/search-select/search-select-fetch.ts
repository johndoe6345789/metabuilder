import { readList } from '@/lib/db/read-list'
import type { SearchSelectItem } from './search-select-types'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface SearchSelectFetchArgs {
  tenant: string
  packageName: string
  entity: string
  query: string
  getLabel: (record: Record<string, unknown>) => string
}

/** One search (or browse, when `query` is blank) against DBAL's
 *  entity list/`_search` endpoints. Never throws -- an empty result
 *  list means "show no matches", not "something broke". */
export async function fetchSearchResults({
  tenant,
  packageName,
  entity,
  query,
  getLabel,
}: SearchSelectFetchArgs): Promise<SearchSelectItem[]> {
  try {
    const base = `${DBAL}/${tenant}/${packageName}/${entity}`
    const url =
      query.trim().length > 0
        ? `${base}/_search?${new URLSearchParams({ q: query, limit: '10' }).toString()}`
        : `${base}?${new URLSearchParams({ limit: '10' }).toString()}`
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return []
    const rows = readList<Record<string, unknown>>(await res.json())
    return rows
      .filter(r => typeof r.id === 'string')
      .map(r => ({ id: r.id as string, label: getLabel(r) }))
  } catch {
    return []
  }
}
