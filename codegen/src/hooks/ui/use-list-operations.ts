import { useState, useCallback } from 'react'

export interface ListOperationsOptions<T> {
  initialItems?: T[]
  getId?: (item: T) => string | number
  onItemsChange?: (items: T[]) => void
}

export function useListOperations<T>({
  initialItems = [],
  getId = (item: any) => item.id,
  onItemsChange,
}: ListOperationsOptions<T> = {}) {
  const [items, setItemsState] = useState<T[]>(initialItems)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  const setItems = useCallback(
    (newItems: T[] | ((prev: T[]) => T[])) => {
      setItemsState((prev) => {
        const updated = typeof newItems === 'function' ? newItems(prev) : newItems
        onItemsChange?.(updated)
        return updated
      })
    },
    [onItemsChange]
  )

  const addItem = useCallback(
    (item: T, position?: number) => {
      setItems((prev) => {
        if (position !== undefined && position >= 0 && position <= prev.length) {
          const newItems = [...prev]
          newItems.splice(position, 0, item)
          return newItems
        }
        return [...prev, item]
      })
    },
    [setItems]
  )

  const updateItem = useCallback(
    (id: string | number, updates: Partial<T> | ((item: T) => T)) => {
      setItems((prev) =>
        prev.map((item) => {
          if (getId(item) === id) {
            return typeof updates === 'function' ? updates(item) : { ...item, ...updates }
          }
          return item
        })
      )
    },
    [getId, setItems]
  )

  const removeItem = useCallback(
    (id: string | number) => {
      setItems((prev) => prev.filter((item) => getId(item) !== id))
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    },
    [getId, setItems]
  )

  const removeItems = useCallback(
    (ids: (string | number)[]) => {
      const idSet = new Set(ids)
      setItems((prev) => prev.filter((item) => !idSet.has(getId(item))))
      setSelectedIds((prev) => {
        const newSet = new Set(prev)
        ids.forEach((id) => newSet.delete(id))
        return newSet
      })
    },
    [getId, setItems]
  )

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      setItems((prev) => {
        if (
          fromIndex < 0 ||
          fromIndex >= prev.length ||
          toIndex < 0 ||
          toIndex >= prev.length
        ) {
          return prev
        }
        const newItems = [...prev]
        const [movedItem] = newItems.splice(fromIndex, 1)
        newItems.splice(toIndex, 0, movedItem)
        return newItems
      })
    },
    [setItems]
  )

  const toggleSelection = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getId)))
  }, [items, getId])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const removeSelected = useCallback(() => {
    removeItems(Array.from(selectedIds))
  }, [selectedIds, removeItems])

  const findById = useCallback(
    (id: string | number) => {
      return items.find((item) => getId(item) === id)
    },
    [items, getId]
  )

  const clear = useCallback(() => {
    setItems([])
    setSelectedIds(new Set())
  }, [setItems])

  return {
    items,
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isEmpty: items.length === 0,
    setItems,
    addItem,
    updateItem,
    removeItem,
    removeItems,
    moveItem,
    toggleSelection,
    selectAll,
    clearSelection,
    removeSelected,
    findById,
    clear,
  }
}
