/**
 * useQueue hook - Queue/FIFO (First In First Out) operations
 * Provides React state management for queue data structures
 */

import { useCallback, useRef, useState } from 'react'

export interface UseQueueReturn<T> {
  items: T[]
  enqueue: (item: T) => void
  dequeue: () => T | undefined
  peek: () => T | undefined
  clear: () => void
  isEmpty: boolean
  size: number
}

/**
 * Hook for managing queue state with FIFO (First In First Out) operations
 * @template T - The type of items in the queue
 * @param initialItems - Optional initial items for the queue (front to back)
 * @returns Object containing the queue items and operation methods
 */
export function useQueue<T>(initialItems?: T[]): UseQueueReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems ?? [])
  const lastDequeuedRef = useRef<T | undefined>(undefined)

  const enqueue = useCallback((item: T) => {
    setItems((prevItems) => [...prevItems, item])
  }, [])

  const dequeue = useCallback(() => {
    if (items.length === 0) {
      return undefined
    }
    const dequeued = items[0]
    lastDequeuedRef.current = dequeued
    setItems((prevItems) => prevItems.slice(1))
    return dequeued
  }, [items])

  const peek = useCallback(() => {
    return items.length > 0 ? items[0] : undefined
  }, [items])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    enqueue,
    dequeue,
    peek,
    clear,
    isEmpty: items.length === 0,
    size: items.length,
  }
}
