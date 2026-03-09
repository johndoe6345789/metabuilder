import { useState, useCallback } from 'react'

export interface SelectionConfig<T> {
  items: T[]
  multiple?: boolean
  idField?: keyof T
}

export function useSelection<T extends Record<string, any>>({
  items,
  multiple = false,
  idField = 'id' as keyof T,
}: SelectionConfig<T>) {
  const [selected, setSelected] = useState<Set<string | number>>(new Set())

  const toggle = useCallback((id: string | number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!multiple) {
          next.clear()
        }
        next.add(id)
      }
      return next
    })
  }, [multiple])

  const select = useCallback((id: string | number) => {
    setSelected(prev => {
      const next: Set<string | number> = multiple ? new Set(prev) : new Set<string | number>()
      next.add(id)
      return next
    })
  }, [multiple])

  const deselect = useCallback((id: string | number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (multiple) {
      setSelected(new Set(items.map(item => item[idField])))
    }
  }, [items, idField, multiple])

  const deselectAll = useCallback(() => {
    setSelected(new Set())
  }, [])

  const isSelected = useCallback((id: string | number) => {
    return selected.has(id)
  }, [selected])

  const getSelected = useCallback(() => {
    return items.filter(item => selected.has(item[idField]))
  }, [items, selected, idField])

  return {
    selected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    isSelected,
    getSelected,
    count: selected.size,
    hasSelection: selected.size > 0,
  }
}
