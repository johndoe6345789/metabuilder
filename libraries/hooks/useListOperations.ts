/**
 * useListOperations Hook
 * Complete list management with CRUD operations and selection
 *
 * @example
 * interface Item { id: string; name: string }
 *
 * const list = useListOperations<Item>({
 *   initialItems: [],
 *   getId: (item) => item.id,
 *   onItemsChange: (items) => console.log('Items changed:', items)
 * })
 *
 * // Add items
 * list.addItem({ id: '1', name: 'Item 1' })
 * list.addItem({ id: '2', name: 'Item 2' }, 0) // Insert at position
 *
 * // Update items
 * list.updateItem('1', { name: 'Updated' })
 * list.updateItem('1', (item) => ({ ...item, name: item.name + ' Updated' }))
 *
 * // Remove items
 * list.removeItem('1')
 * list.removeItems(['1', '2'])
 *
 * // Selection
 * list.toggleSelection('1')
 * list.selectAll()
 * list.removeSelected()
 */

import { useState, useCallback } from 'react'

export interface ListOperationsOptions<T> {
  /** Initial items in the list */
  initialItems?: T[]
  /** Function to extract ID from an item (default: item.id) */
  getId?: (item: T) => string | number
  /** Callback when items change */
  onItemsChange?: (items: T[]) => void
}

export interface UseListOperationsReturn<T> {
  /** Current items in the list */
  items: T[]
  /** Array of selected item IDs */
  selectedIds: (string | number)[]
  /** Number of selected items */
  selectedCount: number
  /** Whether the list is empty */
  isEmpty: boolean
  /** Set items directly */
  setItems: (items: T[] | ((prev: T[]) => T[])) => void
  /** Add an item to the list */
  addItem: (item: T, position?: number) => void
  /** Update an item by ID */
  updateItem: (id: string | number, updates: Partial<T> | ((item: T) => T)) => void
  /** Remove an item by ID */
  removeItem: (id: string | number) => void
  /** Remove multiple items by IDs */
  removeItems: (ids: (string | number)[]) => void
  /** Move an item from one position to another */
  moveItem: (fromIndex: number, toIndex: number) => void
  /** Toggle selection of an item */
  toggleSelection: (id: string | number) => void
  /** Select all items */
  selectAll: () => void
  /** Clear all selections */
  clearSelection: () => void
  /** Remove all selected items */
  removeSelected: () => void
  /** Find an item by ID */
  findById: (id: string | number) => T | undefined
  /** Clear all items and selections */
  clear: () => void
}

/**
 * Hook for managing list operations with selection support
 * @param options - Configuration options
 * @returns Object containing list state and operation methods
 */
export function useListOperations<T>({
  initialItems = [],
  getId = (item: any) => item.id,
  onItemsChange,
}: ListOperationsOptions<T> = {}): UseListOperationsReturn<T> {
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
