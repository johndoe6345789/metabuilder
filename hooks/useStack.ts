/**
 * useStack hook - Stack/LIFO (Last In First Out) operations
 * Provides React state management for stack data structures
 */

import { useCallback, useRef, useState } from 'react'

export interface UseStackReturn<T> {
  items: T[]
  push: (item: T) => void
  pop: () => T | undefined
  peek: () => T | undefined
  clear: () => void
  isEmpty: boolean
  size: number
}

/**
 * Hook for managing stack state with LIFO (Last In First Out) operations
 * @template T - The type of items in the stack
 * @param initialItems - Optional initial items for the stack (bottom to top)
 * @returns Object containing the stack items and operation methods
 */
export function useStack<T>(initialItems?: T[]): UseStackReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems ?? [])
  const lastPoppedRef = useRef<T | undefined>(undefined)

  const push = useCallback((item: T) => {
    setItems((prevItems) => [...prevItems, item])
  }, [])

  const pop = useCallback(() => {
    if (items.length === 0) {
      return undefined
    }
    const popped = items[items.length - 1]
    lastPoppedRef.current = popped
    setItems((prevItems) => prevItems.slice(0, -1))
    return popped
  }, [items])

  const peek = useCallback(() => {
    return items.length > 0 ? items[items.length - 1] : undefined
  }, [items])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    push,
    pop,
    peek,
    clear,
    isEmpty: items.length === 0,
    size: items.length,
  }
}
