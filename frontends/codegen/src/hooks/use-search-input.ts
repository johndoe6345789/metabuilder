/**
 * useSearchInput — universal search aggregating
 * navigation, Redux entities, and DBAL.
 *
 * Returns categorized results for the inline header
 * search dropdown.
 *
 * Returns a `searchResultsContent` React element
 * because JSON definitions can't render dynamic lists.
 */

import { useState, useCallback, useMemo } from 'react'
import {
  useDBALSearch,
  type DBALSearchResult,
} from '@/hooks/use-dbal-search'
import { useTranslation } from '@/hooks/use-translation'
import {
  useSearchLocalResults,
} from './use-search-local-results'
import {
  useSearchInputRenderer,
} from './use-search-input-renderer'

// ── Types ────────────────────────────────────────────────

export interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  page: string
}

export interface SearchCategory {
  label: string
  results: SearchResultItem[]
}

const SLICE_TO_PAGE: Record<string, string> = {
  files: 'code',
  models: 'models',
  components: 'components',
  componentTrees: 'component-trees',
  workflows: 'workflows',
  lambdas: 'lambdas',
}

// ── Hook ─────────────────────────────────────────────────

interface UseSearchInputArgs {
  onNavigate: (page: string) => void
  t?: (key: string, fallback?: string) => string
}

export function useSearchInput({
  onNavigate,
  t: externalT,
}: UseSearchInputArgs) {
  const [query, setQueryState] = useState('')
  const [dropdownOpen, setDropdownOpen] =
    useState(false)

  const { t: internalT } = useTranslation()
  const t = externalT || internalT

  const { results: dbalResults, loading: dbalLoading } =
    useDBALSearch(query)

  const localCategories = useSearchLocalResults({
    query,
    t,
  })

  const dbalCategory = useMemo<SearchCategory | null>(
    () => {
      if (dbalResults.length === 0) return null
      return {
        label: 'Database',
        results: dbalResults.map(
          (r: DBALSearchResult) => ({
            id: r.id,
            title: r.title,
            subtitle:
              `${r.entityType} — ${r.subtitle}`,
            page:
              SLICE_TO_PAGE[r.sliceName] ||
              'database',
          })
        ),
      }
    },
    [dbalResults]
  )

  const categories = useMemo<SearchCategory[]>(() => {
    const merged = [...localCategories]
    if (dbalCategory) merged.push(dbalCategory)
    return merged
  }, [localCategories, dbalCategory])

  const totalResults = useMemo(
    () =>
      categories.reduce(
        (sum, cat) => sum + cat.results.length,
        0
      ),
    [categories]
  )

  const showResults = dropdownOpen && totalResults > 0
  const showEmpty =
    dropdownOpen &&
    query.length >= 2 &&
    totalResults === 0 &&
    !dbalLoading

  const handleSelect = useCallback(
    (result: SearchResultItem) => {
      onNavigate(result.page)
      setQueryState('')
      setDropdownOpen(false)
    },
    [onNavigate]
  )

  const handleQueryChange = useCallback(
    (
      valueOrEvent:
        | string
        | { target: { value: string } }
    ) => {
      const value =
        typeof valueOrEvent === 'string'
          ? valueOrEvent
          : valueOrEvent?.target?.value ?? ''
      setQueryState(value)
      setDropdownOpen(value.length >= 1)
    },
    []
  )

  const handleBlur = useCallback(() => {
    setTimeout(() => setDropdownOpen(false), 200)
  }, [])

  const handleFocus = useCallback(() => {
    if (query.length >= 1 && totalResults > 0) {
      setDropdownOpen(true)
    }
  }, [query, totalResults])

  const { searchResultsContent } =
    useSearchInputRenderer({
      categories,
      onSelect: handleSelect,
    })

  return {
    query,
    setQuery: handleQueryChange,
    categories,
    totalResults,
    loading: dbalLoading,
    showResults,
    showEmpty,
    handleSelect,
    handleBlur,
    handleFocus,
    searchResultsContent,
  }
}
