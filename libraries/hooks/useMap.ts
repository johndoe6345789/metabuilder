/**
 * useMap hook - Typed Map state management
 * Provides React state management for Map data structures with full operation support
 */

import { useState, useCallback } from 'react'

export interface UseMapReturn<K, V> {
  data: Map<K, V>
  set: (key: K, value: V) => void
  get: (key: K) => V | undefined
  delete: (key: K) => void
  clear: () => void
  has: (key: K) => boolean
  entries: () => IterableIterator<[K, V]>
  keys: () => IterableIterator<K>
  values: () => IterableIterator<V>
}

/**
 * Hook for managing Map state
 * @template K - The type of keys in the map
 * @template V - The type of values in the map
 * @param initialEntries - Optional initial key-value pairs
 * @returns Object containing the map and operation methods
 */
export function useMap<K, V>(initialEntries?: Array<[K, V]>): UseMapReturn<K, V> {
  const [data, setData] = useState<Map<K, V>>(
    () => new Map(initialEntries)
  )

  const set = useCallback((key: K, value: V) => {
    setData((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.set(key, value)
      return newMap
    })
  }, [])

  const get = useCallback((key: K) => {
    return data.get(key)
  }, [data])

  const deleteKey = useCallback((key: K) => {
    setData((prevMap) => {
      const newMap = new Map(prevMap)
      newMap.delete(key)
      return newMap
    })
  }, [])

  const clear = useCallback(() => {
    setData(new Map())
  }, [])

  const has = useCallback((key: K) => {
    return data.has(key)
  }, [data])

  const entries = useCallback(() => {
    return data.entries()
  }, [data])

  const keys = useCallback(() => {
    return data.keys()
  }, [data])

  const values = useCallback(() => {
    return data.values()
  }, [data])

  return {
    data,
    set,
    get,
    delete: deleteKey,
    clear,
    has,
    entries,
    keys,
    values,
  }
}
