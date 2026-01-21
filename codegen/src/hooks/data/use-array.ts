import { useKV } from '@/hooks/use-kv'
import { useCallback } from 'react'

export function useArray<T>(key: string, defaultValue: T[] = []) {
  const [items, setItems] = useKV<T[]>(key, defaultValue)
  const safeItems = items || []

  const add = useCallback((item: T) => {
    setItems((current) => [...(current || []), item])
  }, [setItems])

  const addMany = useCallback((newItems: T[]) => {
    setItems((current) => [...(current || []), ...newItems])
  }, [setItems])

  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems((current) => (current || []).filter((item) => !predicate(item)))
  }, [setItems])

  const update = useCallback(
    (predicate: (item: T) => boolean, updater: (item: T) => T) => {
      setItems((current) =>
        (current || []).map((item) => (predicate(item) ? updater(item) : item))
      )
    },
    [setItems]
  )

  const replace = useCallback((newItems: T[]) => {
    setItems(newItems)
  }, [setItems])

  const clear = useCallback(() => {
    setItems([])
  }, [setItems])

  const find = useCallback(
    (predicate: (item: T) => boolean) => {
      return safeItems.find(predicate)
    },
    [safeItems]
  )

  const filter = useCallback(
    (predicate: (item: T) => boolean) => {
      return safeItems.filter(predicate)
    },
    [safeItems]
  )

  return {
    items: safeItems,
    add,
    addMany,
    remove,
    update,
    replace,
    clear,
    find,
    filter,
    count: safeItems.length,
  }
}
