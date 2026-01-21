import { useState, useMemo, useCallback } from 'react'

export interface SearchFilterConfig<T> {
  items: T[]
  searchFields?: (keyof T)[]
  filterFn?: (item: T, filters: Record<string, any>) => boolean
}

export function useSearchFilter<T extends Record<string, any>>({
  items,
  searchFields = [],
  filterFn,
}: SearchFilterConfig<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})

  const filtered = useMemo(() => {
    let result = items

    if (searchQuery && searchFields.length > 0) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field]
          return String(value).toLowerCase().includes(query)
        })
      )
    }

    if (filterFn && Object.keys(filters).length > 0) {
      result = result.filter(item => filterFn(item, filters))
    }

    return result
  }, [items, searchQuery, searchFields, filters, filterFn])

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setFilters({})
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    clearFilters,
    filtered,
    count: filtered.length,
    total: items.length,
  }
}
