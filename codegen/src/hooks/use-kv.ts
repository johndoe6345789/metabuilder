import { useState, useEffect, useCallback } from 'react'
import { getStorage } from '@/lib/storage-service'

export function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValueInternal] = useState<T>(defaultValue)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initValue = async () => {
      try {
        const storage = getStorage()
        const storedValue = await storage.get<T>(key)
        if (storedValue !== undefined) {
          setValueInternal(storedValue)
        }
      } catch (error) {
        console.error('Error reading from storage:', error)
      } finally {
        setInitialized(true)
      }
    }
    initValue()
  }, [key])

  const setValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      try {
        setValueInternal((prevValue) => {
          const valueToStore =
            typeof newValue === 'function'
              ? (newValue as (prev: T) => T)(prevValue)
              : newValue

          const storage = getStorage()
          storage.set(key, valueToStore).catch(error => {
            console.error('Error writing to storage:', error)
          })

          return valueToStore
        })
      } catch (error) {
        console.error('Error writing to storage:', error)
      }
    },
    [key]
  )

  const deleteValue = useCallback(async () => {
    try {
      const storage = getStorage()
      await storage.delete(key)
      setValueInternal(defaultValue)
    } catch (error) {
      console.error('Error deleting from storage:', error)
    }
  }, [key, defaultValue])

  return [initialized ? value : defaultValue, setValue, deleteValue]
}
