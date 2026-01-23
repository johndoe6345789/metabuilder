import { useCallback, useState } from 'react'

export function useAsyncCallback<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async (...args: any[]) => {
    setLoading(true)
    setError(null)
    try {
      return await fn(...args)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { execute, loading, error }
}
