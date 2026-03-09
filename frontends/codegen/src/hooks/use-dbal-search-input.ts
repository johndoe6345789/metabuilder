/**
 * useDBALSearchInput — state for the inline DBAL search input in the header
 *
 * Wraps useDBALSearch with input state and navigation mapping.
 */

import { useState, useCallback, ChangeEvent } from 'react'
import { useDBALSearch, type DBALSearchResult } from '@/hooks/use-dbal-search'

const SLICE_TO_PAGE: Record<string, string> = {
  files: 'code',
  models: 'models',
  components: 'components',
  componentTrees: 'component-trees',
  workflows: 'workflows',
  lambdas: 'lambdas',
}

interface UseDBALSearchInputArgs {
  onNavigate: (page: string) => void
}

export function useDBALSearchInput({ onNavigate }: UseDBALSearchInputArgs) {
  const [query, setQueryState] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { results, loading, error } = useDBALSearch(query)

  const handleSelect = useCallback(
    (result: DBALSearchResult) => {
      const page = SLICE_TO_PAGE[result.sliceName] || 'dashboard'
      onNavigate(page)
      setQueryState('')
      setDropdownOpen(false)
    },
    [onNavigate]
  )

  /** Directly set the search query string */
  const setQuery = useCallback((value: string) => {
    setQueryState(value)
    setDropdownOpen(value.length >= 2)
  }, [])

  /** Handle input change events from an <input onChange> handler */
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [setQuery])

  const handleBlur = useCallback(() => {
    // Delay to allow click on dropdown items
    setTimeout(() => setDropdownOpen(false), 200)
  }, [])

  const handleFocus = useCallback(() => {
    if (query.length >= 2 && results.length > 0) {
      setDropdownOpen(true)
    }
  }, [query, results])

  // Derived booleans for JSON condition bindings
  const showResults = dropdownOpen && results && results.length > 0
  const showEmpty = dropdownOpen && query.length >= 2 && (!results || results.length === 0) && !loading

  return {
    query,
    setQuery,
    handleInputChange,
    results,
    loading,
    error,
    dropdownOpen,
    showResults,
    showEmpty,
    handleSelect,
    handleBlur,
    handleFocus,
  }
}
