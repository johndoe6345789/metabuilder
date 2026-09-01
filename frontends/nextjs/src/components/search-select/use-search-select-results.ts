import { useCallback, useEffect, useState } from 'react'
import type { SearchSelectItem } from './search-select-types'
import { fetchSearchResults } from './search-select-fetch'

export interface UseSearchSelectResultsArgs {
  tenant: string
  packageName: string
  entity: string
  getLabel: (record: Record<string, unknown>) => string
  isOpen: boolean
  debouncedQuery: string
}

/** The result list itself: fetch-on-open-or-query-change, plus the
 *  loading/highlighted state that goes with it. Split out of
 *  useSearchSelect, which owns the rest of the dropdown's behaviour. */
export function useSearchSelectResults({
  tenant,
  packageName,
  entity,
  getLabel,
  isOpen,
  debouncedQuery,
}: UseSearchSelectResultsArgs) {
  const [results, setResults] = useState<SearchSelectItem[]>([])
  const [loading, setLoading] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  const fetchResults = useCallback(
    async (q: string) => {
      setLoading(true)
      const items = await fetchSearchResults({
        tenant,
        packageName,
        entity,
        query: q,
        getLabel,
      })
      setResults(items)
      setHighlighted(0)
      setLoading(false)
    },
    [tenant, packageName, entity, getLabel]
  )

  useEffect(() => {
    if (!isOpen) return
    void Promise.resolve().then(() => fetchResults(debouncedQuery))
  }, [debouncedQuery, isOpen, fetchResults])

  return {
    results,
    setResults,
    loading,
    highlighted,
    setHighlighted,
    fetchResults,
  }
}
