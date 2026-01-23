/**
 * useTableState Hook
 * Unified data grid state management combining pagination, sorting, filtering, and searching
 *
 * Features:
 * - Multi-column sorting (ascending/descending)
 * - Multi-filter with operators (eq, contains, gt, lt, in, etc.)
 * - Full-text search across specified fields
 * - Pagination with configurable page size
 * - All operations chainable and update instantly
 * - Memory efficient - only processes visible data
 *
 * @example
 * const table = useTableState(items, {
 *   pageSize: 10,
 *   searchFields: ['name', 'email'],
 *   defaultSort: { field: 'createdAt', direction: 'desc' }
 * })
 *
 * // In component:
 * <TextField onChange={(e) => table.setSearch(e.target.value)} />
 * <Button onClick={() => table.sort('name')}>Sort by Name</Button>
 * <button onClick={() => table.addFilter({ field: 'status', operator: 'eq', value: 'active' })}>
 *   Filter Active
 * </button>
 */

import { useMemo, useCallback, useState } from 'react'

export type FilterOperator = 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'startsWith' | 'endsWith'

export interface Filter<T> {
  field: keyof T
  operator: FilterOperator
  value: any
  caseSensitive?: boolean
}

export interface SortConfig<T> {
  field: keyof T
  direction: 'asc' | 'desc'
}

export interface UseTableStateOptions<T> {
  /** Fields to search in (for search functionality) */
  searchFields?: (keyof T)[]
  /** Initial page size - default 10 */
  pageSize?: number
  /** Initial sort configuration */
  defaultSort?: SortConfig<T>
  /** Initial filters */
  defaultFilters?: Filter<T>[]
  /** Initial search query */
  defaultSearch?: string
}

export interface UseTableStateReturn<T> {
  // Data
  items: T[]
  filteredItems: T[]
  paginatedItems: T[]
  totalItems: number
  totalPages: number

  // Pagination
  currentPage: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void

  // Sorting
  sort: SortConfig<T> | null
  sort: (field: keyof T, direction?: 'asc' | 'desc') => void
  clearSort: () => void

  // Filtering
  filters: Filter<T>[]
  addFilter: (filter: Filter<T>) => void
  removeFilter: (index: number) => void
  updateFilter: (index: number, filter: Filter<T>) => void
  clearFilters: () => void

  // Search
  search: string
  setSearch: (query: string) => void
  clearSearch: () => void

  // Utilities
  reset: () => void
  hasActiveFilters: boolean
  hasSearch: boolean
}

export function useTableState<T extends Record<string, any>>(
  items: T[],
  options: UseTableStateOptions<T> = {}
): UseTableStateReturn<T> {
  const {
    searchFields = Object.keys(items[0] || {}) as (keyof T)[],
    pageSize: initialPageSize = 10,
    defaultSort = null,
    defaultFilters = [],
    defaultSearch = '',
  } = options

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(defaultSort)
  const [filters, setFilters] = useState<Filter<T>[]>(defaultFilters)
  const [search, setSearch] = useState(defaultSearch)

  // Apply filters
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Apply filters
    for (const filter of filters) {
      result = result.filter((item) => {
        const fieldValue = item[filter.field]
        const { operator, value, caseSensitive = false } = filter

        const normalize = (val: any) => {
          if (typeof val === 'string' && !caseSensitive) {
            return val.toLowerCase()
          }
          return val
        }

        const normalizedValue = normalize(value)
        const normalizedFieldValue = normalize(fieldValue)

        switch (operator) {
          case 'eq':
            return normalizedFieldValue === normalizedValue
          case 'contains':
            return String(normalizedFieldValue).includes(String(normalizedValue))
          case 'startsWith':
            return String(normalizedFieldValue).startsWith(String(normalizedValue))
          case 'endsWith':
            return String(normalizedFieldValue).endsWith(String(normalizedValue))
          case 'gt':
            return fieldValue > value
          case 'gte':
            return fieldValue >= value
          case 'lt':
            return fieldValue < value
          case 'lte':
            return fieldValue <= value
          case 'in':
            return Array.isArray(value) && value.includes(normalizedFieldValue)
          case 'nin':
            return !Array.isArray(value) || !value.includes(normalizedFieldValue)
          default:
            return true
        }
      })
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const value = String(item[field] || '').toLowerCase()
          return value.includes(searchLower)
        })
      })
    }

    return result
  }, [items, filters, search, searchFields])

  // Apply sorting
  const sortedItems = useMemo(() => {
    if (!sortConfig) return filteredItems

    const sorted = [...filteredItems]
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      if (aValue === bValue) return 0

      const isAscending = sortConfig.direction === 'asc'
      if (isAscending) {
        return aValue < bValue ? -1 : 1
      } else {
        return aValue > bValue ? -1 : 1
      }
    })

    return sorted
  }, [filteredItems, sortConfig])

  // Apply pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedItems.slice(startIndex, startIndex + pageSize)
  }, [sortedItems, currentPage, pageSize])

  const totalPages = Math.ceil(sortedItems.length / pageSize)

  // Handlers
  const handleSort = useCallback(
    (field: keyof T, direction?: 'asc' | 'desc') => {
      setSortConfig((prev) => {
        // Toggle direction if clicking same field
        if (prev?.field === field && !direction) {
          return {
            field,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
          }
        }
        return { field, direction: direction || 'asc' }
      })
      setCurrentPage(1) // Reset to first page
    },
    []
  )

  const handleAddFilter = useCallback((filter: Filter<T>) => {
    setFilters((prev) => [...prev, filter])
    setCurrentPage(1)
  }, [])

  const handleRemoveFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index))
    setCurrentPage(1)
  }, [])

  const handleUpdateFilter = useCallback((index: number, filter: Filter<T>) => {
    setFilters((prev) => {
      const updated = [...prev]
      updated[index] = filter
      return updated
    })
    setCurrentPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters([])
    setCurrentPage(1)
  }, [])

  const handleSetSearch = useCallback((query: string) => {
    setSearch(query)
    setCurrentPage(1)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearch('')
    setCurrentPage(1)
  }, [])

  const handleSetPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(Math.max(1, size))
    setCurrentPage(1)
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }, [totalPages])

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  const handleReset = useCallback(() => {
    setCurrentPage(1)
    setPageSize(initialPageSize)
    setSortConfig(defaultSort || null)
    setFilters(defaultFilters)
    setSearch(defaultSearch)
  }, [initialPageSize, defaultSort, defaultFilters, defaultSearch])

  return {
    items,
    filteredItems,
    paginatedItems,
    totalItems: sortedItems.length,
    totalPages,
    currentPage,
    pageSize,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    nextPage: handleNextPage,
    prevPage: handlePrevPage,
    goToFirstPage: () => setCurrentPage(1),
    goToLastPage: () => setCurrentPage(totalPages),
    sort: sortConfig,
    sort: handleSort,
    clearSort: () => setSortConfig(null),
    filters,
    addFilter: handleAddFilter,
    removeFilter: handleRemoveFilter,
    updateFilter: handleUpdateFilter,
    clearFilters: handleClearFilters,
    search,
    setSearch: handleSetSearch,
    clearSearch: handleClearSearch,
    reset: handleReset,
    hasActiveFilters: filters.length > 0,
    hasSearch: search.length > 0,
  }
}
