import { useCallback } from 'react'

export interface CRUDOperations<T> {
  create: (item: T) => void
  read: (id: string | number) => T | undefined
  update: (id: string | number, updates: Partial<T>) => void
  delete: (id: string | number) => void
  list: () => T[]
}

export interface CRUDConfig<T> {
  items: T[]
  setItems: (updater: (items: T[]) => T[]) => void
  idField?: keyof T
}

export function useCRUD<T extends Record<string, any>>({
  items,
  setItems,
  idField = 'id' as keyof T,
}: CRUDConfig<T>): CRUDOperations<T> {
  const create = useCallback((item: T) => {
    setItems(current => [...current, item])
  }, [setItems])

  const read = useCallback((id: string | number) => {
    return items.find(item => item[idField] === id)
  }, [items, idField])

  const update = useCallback((id: string | number, updates: Partial<T>) => {
    setItems(current =>
      current.map(item =>
        item[idField] === id ? { ...item, ...updates } : item
      )
    )
  }, [setItems, idField])

  const deleteItem = useCallback((id: string | number) => {
    setItems(current => current.filter(item => item[idField] !== id))
  }, [setItems, idField])

  const list = useCallback(() => items, [items])

  return {
    create,
    read,
    update,
    delete: deleteItem,
    list,
  }
}
