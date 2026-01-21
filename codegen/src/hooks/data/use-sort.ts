import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig<T> {
  items: T[]
  defaultField?: keyof T
  defaultDirection?: SortDirection
}

export function useSort<T extends Record<string, any>>({
  items,
  defaultField,
  defaultDirection = 'asc',
}: SortConfig<T>) {
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection)

  const sorted = useMemo(() => {
    if (!sortField) return items

    return [...items].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal === bVal) return 0

      const comparison = aVal < bVal ? -1 : 1
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [items, sortField, sortDirection])

  const toggleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  const resetSort = useCallback(() => {
    setSortField(defaultField)
    setSortDirection(defaultDirection)
  }, [defaultField, defaultDirection])

  return {
    sorted,
    sortField,
    sortDirection,
    toggleSort,
    resetSort,
  }
}
