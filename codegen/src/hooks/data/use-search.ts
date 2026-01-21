import { useState, useMemo } from 'react'

export interface UseSearchOptions<T> {
  items: T[]
  searchFields: (keyof T)[]
  caseSensitive?: boolean
}

export function useSearch<T>(options: UseSearchOptions<T>) {
  const { items, searchFields, caseSensitive = false } = options
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return items

    const searchTerm = caseSensitive ? query : query.toLowerCase()

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (value == null) return false
        
        const stringValue = String(value)
        const comparable = caseSensitive ? stringValue : stringValue.toLowerCase()
        
        return comparable.includes(searchTerm)
      })
    })
  }, [items, query, searchFields, caseSensitive])

  return {
    query,
    setQuery,
    filtered,
    hasQuery: query.trim().length > 0,
    resultCount: filtered.length,
  }
}
