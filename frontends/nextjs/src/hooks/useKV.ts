/**
 * Hook for key-value storage operations
 */
import { useState, useCallback } from 'react'

export interface UseKVReturn {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  delete: (key: string) => Promise<void>
  list: (prefix?: string) => Promise<string[]>
  isLoading: boolean
  error: Error | null
}

export function useKV(): UseKVReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const get = useCallback(async (key: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/kv/${key}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to get key')
      }
      const data = await response.json()
      return data.value
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const set = useCallback(async (key: string, value: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/kv/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      if (!response.ok) throw new Error('Failed to set key')
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteKey = useCallback(async (key: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/kv/${key}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete key')
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const list = useCallback(async (prefix?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const queryString = prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''
      const response = await fetch(`/api/kv${queryString}`)
      if (!response.ok) throw new Error('Failed to list keys')
      const data = await response.json()
      return data.keys || []
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    get,
    set,
    delete: deleteKey,
    list,
    isLoading,
    error,
  }
}
