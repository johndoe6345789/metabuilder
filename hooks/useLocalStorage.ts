/**
 * useLocalStorage Hook
 * Enhanced localStorage hook with versioning, serialization, and type safety
 *
 * Features:
 * - Generic typing for any value type
 * - Automatic JSON serialization/deserialization
 * - Version-based persistence (prevents stale data conflicts)
 * - Graceful fallback to initial value on parse errors
 * - SSR-safe (checks for window availability)
 * - Clear method for removing values
 *
 * @example
 * const { value, setValue, clear } = useLocalStorage<User>(
 *   'user-profile',
 *   { id: '', name: '', email: '' },
 *   { version: 1 }
 * )
 *
 * // Use in component
 * <TextField
 *   value={value.name}
 *   onChange={(e) => setValue({ ...value, name: e.target.value })}
 * />
 * <Button onClick={clear}>Clear Profile</Button>
 *
 * @example
 * // With object/complex types
 * interface AppSettings {
 *   theme: 'light' | 'dark'
 *   language: string
 *   notifications: boolean
 * }
 *
 * const { value: settings, setValue: updateSettings } = useLocalStorage<AppSettings>(
 *   'app-settings',
 *   { theme: 'light', language: 'en', notifications: true }
 * )
 */

import { useState, useEffect, useCallback } from 'react'

export interface UseLocalStorageOptions {
  /** Storage version for data migration - prevents conflicts with old data */
  version?: number
  /** Custom serializer function */
  serializer?: (value: any) => string
  /** Custom deserializer function */
  deserializer?: (value: string) => any
  /** Sync storage changes across browser tabs */
  syncTabs?: boolean
}

export interface UseLocalStorageReturn<T> {
  /** Current stored value */
  value: T
  /** Update stored value */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Remove from storage and reset to initial value */
  clear: () => void
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn<T> {
  const {
    version = 1,
    serializer = (value) => JSON.stringify({ version, data: value }),
    deserializer = (value) => {
      try {
        const parsed = JSON.parse(value)
        // Handle both new format (with version) and old format (direct value)
        if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
          return parsed.version === version ? parsed.data : initialValue
        }
        return parsed
      } catch {
        return initialValue
      }
    },
    syncTabs = true,
  } = options

  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR-safe check
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch {
      // Handle localStorage access errors (e.g., quota exceeded, private browsing)
      return initialValue
    }
  })

  // Update localStorage when state changes
  const handleSetValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore))
        }
      } catch (error) {
        // Handle quota exceeded and other storage errors
        console.warn(`useLocalStorage: Failed to store value for key "${key}":`, error)
      }
    },
    [key, serializer, storedValue]
  )

  // Handle storage changes in other tabs
  useEffect(() => {
    if (!syncTabs || typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(deserializer(e.newValue))
        } catch {
          // Handle deserialization errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, deserializer, syncTabs])

  // Clear storage
  const handleClear = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`useLocalStorage: Failed to clear key "${key}":`, error)
    }
  }, [key, initialValue])

  return {
    value: storedValue,
    setValue: handleSetValue,
    clear: handleClear,
  }
}
