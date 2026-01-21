import { useState, useEffect, useCallback } from 'react'
import { db, type DBSchema } from '@/lib/db'

type StoreName = keyof DBSchema

export function useIndexedDB<T extends StoreName, V = DBSchema[T]['value']>(
  storeName: T,
  key?: string,
  defaultValue?: V
): [V | undefined, (value: V) => Promise<void>, () => Promise<void>, boolean] {
  const [value, setValue] = useState<V | undefined>(defaultValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!key) {
      setLoading(false)
      return
    }

    let mounted = true

    db.get(storeName, key)
      .then((result) => {
        if (mounted) {
          setValue((result as V) || defaultValue)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.error(`Error loading ${storeName}/${key}:`, error)
        if (mounted) {
          setValue(defaultValue)
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [storeName, key, defaultValue])

  const updateValue = useCallback(
    async (newValue: V) => {
      if (!key) {
        throw new Error('Cannot update value without a key')
      }

      setValue(newValue)

      try {
        await db.put(storeName, newValue as any)
      } catch (error) {
        console.error(`Error saving ${storeName}/${key}:`, error)
        throw error
      }
    },
    [storeName, key]
  )

  const deleteValue = useCallback(async () => {
    if (!key) {
      throw new Error('Cannot delete value without a key')
    }

    setValue(undefined)

    try {
      await db.delete(storeName, key)
    } catch (error) {
      console.error(`Error deleting ${storeName}/${key}:`, error)
      throw error
    }
  }, [storeName, key])

  return [value, updateValue, deleteValue, loading]
}

export function useIndexedDBCollection<T extends StoreName>(
  storeName: T
): [DBSchema[T]['value'][], () => Promise<void>, boolean] {
  const [items, setItems] = useState<DBSchema[T]['value'][]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const result = await db.getAll(storeName)
      setItems(result)
    } catch (error) {
      console.error(`Error loading ${storeName} collection:`, error)
    } finally {
      setLoading(false)
    }
  }, [storeName])

  useEffect(() => {
    refresh()
  }, [refresh])

  return [items, refresh, loading]
}
