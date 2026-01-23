import { useState, useCallback } from 'react'

export function useSort<T>(items: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') {
  const [sortDir, setSortDir] = useState(direction)
  const sorted = useCallback(() => {
    return [...items].sort((a, b) => {
      if (a[key] === b[key]) return 0
      return sortDir === 'asc' ? (a[key] < b[key] ? -1 : 1) : (a[key] > b[key] ? -1 : 1)
    })
  }, [items, key, sortDir])
  return { sorted: sorted(), direction: sortDir, setDirection: setSortDir }
}
