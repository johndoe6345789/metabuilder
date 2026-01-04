/**
 * Hook for DBAL operations
 */
import { useState, useCallback } from 'react'

export interface UseDBALReturn {
  get: (entity: string, id: string) => Promise<unknown>
  list: (entity: string, filter?: Record<string, unknown>) => Promise<unknown[]>
  create: (entity: string, data: Record<string, unknown>) => Promise<unknown>
  update: (entity: string, id: string, data: Record<string, unknown>) => Promise<unknown>
  delete: (entity: string, id: string) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useDBAL(): UseDBALReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const get = useCallback(async (entity: string, id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/${entity}/${id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      return await response.json()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const list = useCallback(async (entity: string, filter?: Record<string, unknown>) => {
    setIsLoading(true)
    setError(null)
    try {
      const queryString = filter ? `?${new URLSearchParams(filter as Record<string, string>).toString()}` : ''
      const response = await fetch(`/api/v1/${entity}${queryString}`)
      if (!response.ok) throw new Error('Failed to fetch')
      return await response.json()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const create = useCallback(async (entity: string, data: Record<string, unknown>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create')
      return await response.json()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const update = useCallback(async (entity: string, id: string, data: Record<string, unknown>) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/${entity}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update')
      return await response.json()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteEntity = useCallback(async (entity: string, id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/${entity}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    get,
    list,
    create,
    update,
    delete: deleteEntity,
    isLoading,
    error,
  }
}
