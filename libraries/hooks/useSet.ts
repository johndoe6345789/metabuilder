/**
 * useSet hook - Typed Set state management
 * Provides React state management for Set data structures with full operation support
 */

import { useState, useCallback } from 'react'

export interface UseSetReturn<T> {
  values: Set<T>
  add: (value: T) => void
  remove: (value: T) => void
  has: (value: T) => boolean
  toggle: (value: T) => void
  clear: () => void
}

/**
 * Hook for managing Set state
 * @template T - The type of values in the set
 * @param initialValues - Optional initial values for the set
 * @returns Object containing the set and operation methods
 */
export function useSet<T>(initialValues?: T[]): UseSetReturn<T> {
  const [values, setValues] = useState<Set<T>>(
    () => new Set(initialValues)
  )

  const add = useCallback((value: T) => {
    setValues((prevSet) => {
      const newSet = new Set(prevSet)
      newSet.add(value)
      return newSet
    })
  }, [])

  const remove = useCallback((value: T) => {
    setValues((prevSet) => {
      const newSet = new Set(prevSet)
      newSet.delete(value)
      return newSet
    })
  }, [])

  const has = useCallback((value: T) => {
    return values.has(value)
  }, [values])

  const toggle = useCallback((value: T) => {
    setValues((prevSet) => {
      const newSet = new Set(prevSet)
      if (newSet.has(value)) {
        newSet.delete(value)
      } else {
        newSet.add(value)
      }
      return newSet
    })
  }, [])

  const clear = useCallback(() => {
    setValues(new Set())
  }, [])

  return {
    values,
    add,
    remove,
    has,
    toggle,
    clear,
  }
}
