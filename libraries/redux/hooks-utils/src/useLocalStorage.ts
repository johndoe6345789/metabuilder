/**
 * useLocalStorage Hook
 * Persistent state backed by localStorage with SSR support
 */

import { useState, useCallback, useEffect } from 'react'

export interface UseLocalStorageOptions<T> {
  /** Serializer for custom types (default: JSON.stringify) */
  serializer?: (value: T) => string
  /** Deserializer for custom types (default: JSON.parse) */
  deserializer?: (value: string) => T
}

export interface UseLocalStorageReturn<T> {
  /** Current stored value */
  value: T
  /** Update stored value */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Remove item from localStorage */
  remove: () => void
}

/**
 * Hook for persistent state via localStorage
 *
 * @example
 * const { value, setValue, remove } = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): UseLocalStorageReturn<T> {
  const serializer = options?.serializer ?? JSON.stringify
  const deserializer = options?.deserializer ?? JSON.parse

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(newValue))
        }
        return newValue
      })
    },
    [key, serializer]
  )

  const remove = useCallback(() => {
    setStoredValue(initialValue)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  }, [key, initialValue])

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue))
        } catch {
          // Ignore deserialization errors
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, deserializer])

  return { value: storedValue, setValue, remove }
}
