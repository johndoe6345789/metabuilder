import { useState, useCallback } from 'react'

export interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

export function useSortable<T extends Record<string, any>>(items: T[], initialSort?: SortConfig<T>) {
  const [sort, setSort] = useState<SortConfig<T> | null>(initialSort || null)

  const sorted = useCallback(() => {
    if (!sort) return items
    return [...items].sort((a, b) => {
      const aVal = a[sort.key]
      const bVal = b[sort.key]
      if (aVal === bVal) return 0
      const isAsc = sort.direction === 'asc'
      return isAsc ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1)
    })
  }, [items, sort])

  return { sorted: sorted(), sort, setSort }
}
