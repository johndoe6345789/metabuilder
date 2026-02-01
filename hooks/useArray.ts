/**
 * useArray hook - Array operations hook with performance optimization
 * Provides React state management for arrays with full operation support and indexing
 */

import { useState, useCallback } from 'react'

export interface UseArrayReturn<T> {
  items: T[]
  push: (item: T) => void
  pop: () => T | undefined
  shift: () => T | undefined
  unshift: (item: T) => void
  insert: (index: number, item: T) => void
  remove: (index: number) => void
  swap: (indexA: number, indexB: number) => void
  clear: () => void
  filter: (predicate: (item: T) => boolean) => void
  map: <R,>(callback: (item: T) => R) => R[]
  length: number
  get: (index: number) => T | undefined
}

/**
 * Hook for managing array state with common array operations
 * @template T - The type of items in the array
 * @param initialItems - Optional initial items for the array
 * @returns Object containing the array and operation methods
 */
export function useArray<T>(initialItems?: T[]): UseArrayReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems ?? [])

  const push = useCallback((item: T) => {
    setItems((prevItems) => [...prevItems, item])
  }, [])

  const pop = useCallback(() => {
    if (items.length === 0) {
      return undefined
    }
    const popped = items[items.length - 1]
    setItems((prevItems) => prevItems.slice(0, -1))
    return popped
  }, [items])

  const shift = useCallback(() => {
    if (items.length === 0) {
      return undefined
    }
    const shifted = items[0]
    setItems((prevItems) => prevItems.slice(1))
    return shifted
  }, [items])

  const unshift = useCallback((item: T) => {
    setItems((prevItems) => [item, ...prevItems])
  }, [])

  const insert = useCallback((index: number, item: T) => {
    setItems((prevItems) => {
      const cloned = [...prevItems]
      const normalizedIndex = Math.max(0, Math.min(index, cloned.length))
      cloned.splice(normalizedIndex, 0, item)
      return cloned
    })
  }, [])

  const remove = useCallback((index: number) => {
    setItems((prevItems) => {
      if (index < 0 || index >= prevItems.length) {
        return prevItems
      }
      const cloned = [...prevItems]
      cloned.splice(index, 1)
      return cloned
    })
  }, [])

  const swap = useCallback((indexA: number, indexB: number) => {
    setItems((prevItems) => {
      if (
        indexA < 0 ||
        indexA >= prevItems.length ||
        indexB < 0 ||
        indexB >= prevItems.length
      ) {
        return prevItems
      }
      const cloned = [...prevItems]
      ;[cloned[indexA], cloned[indexB]] = [cloned[indexB], cloned[indexA]]
      return cloned
    })
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const filter = useCallback((predicate: (item: T) => boolean) => {
    setItems((prevItems) => prevItems.filter(predicate))
  }, [])

  const map = useCallback(<R,>(callback: (item: T) => R): R[] => {
    return items.map(callback)
  }, [items])

  const get = useCallback((index: number): T | undefined => {
    return items[index]
  }, [items])

  return {
    items,
    push,
    pop,
    shift,
    unshift,
    insert,
    remove,
    swap,
    clear,
    filter,
    map,
    length: items.length,
    get,
  }
}
