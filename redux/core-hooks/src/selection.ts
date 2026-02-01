/**
 * useSelection Hook
 * Multi-item selection management with set operations
 */

import { useState, useCallback } from 'react'

export interface UseSelectionReturn {
  selectedIds: string[]
  select: (id: string) => void
  deselect: (id: string) => void
  toggle: (id: string) => void
  selectAll: (items: { id: string }[]) => void
  deselectAll: () => void
  isSelected: (id: string) => boolean
  count: number
}

/**
 * Manages multi-select state
 */
export function useSelection(): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => new Set(prev).add(id))
  }, [])

  const deselect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((items: { id: string }[]) => {
    setSelectedIds(new Set(items.map((item) => item.id)))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  return {
    selectedIds: Array.from(selectedIds),
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
    count: selectedIds.size,
  }
}
