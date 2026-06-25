/**
 * useAsync Hook
 * Async function wrapper with loading, error, and data state management
 *
 * Features:
 * - Wraps async functions with automatic loading/error/data handling
 * - Generic typing for async function return types
 * - Manual execution with execute() method
 * - Reset functionality to clear data and errors
 * - Automatic cleanup to prevent memory leaks
 * - Dependency tracking for re-execution
 *
 * @example
 * const fetchUser = async (id: string) => {
 *   const res = await fetch(`/api/users/${id}`)
 *   return res.json()
 * }
 *
 * const { data, loading, error, execute } = useAsync(fetchUser, ['userId'])
 *
 * <div>
 *   {loading && <Spinner />}
 *   {error && <Alert severity="error">{error.message}</Alert>}
 *   {data && <UserProfile user={data} />}
 *   <Button onClick={() => execute('123')}>Fetch User</Button>
 * </div>
 *
 * @example
 * // With automatic execution on mount
 * const { data: posts, loading, error } = useAsync(
 *   async () => {
 *     const res = await fetch('/api/posts')
 *     return res.json()
 *   },
 *   [],
 *   { immediate: true }
 * )
 *
 * @example
 * // With error handling and retry
 * const { data, loading, error, execute } = useAsync(
 *   async () => {
 *     try {
 *       const res = await fetch('/api/data')
 *       if (!res.ok) throw new Error(`HTTP ${res.status}`)
 *       return res.json()
 *     } catch (err) {
 *       throw err
 *     }
 *   }
 * )
 *
 * const handleRetry = async () => {
 *   await execute()
 * }
 */

import { useState, useCallback, useEffect, useRef } from 'react'

export interface UseAsyncOptions {
  /** Execute immediately on mount (default: false) */
  immediate?: boolean
  /** Reset error on retry (default: true) */
  resetErrorOnRetry?: boolean
  /** Reset data on retry (default: false) */
  resetDataOnRetry?: boolean
}

export interface UseAsyncReturn<T> {
  /** Result data from async function */
  data: T | undefined
  /** Loading state */
  loading: boolean
  /** Error object if function threw */
  error: Error | undefined
  /** Execute the async function */
  execute: (...args: any[]) => Promise<T | undefined>
  /** Reset data, error, and loading state */
  reset: () => void
}

/**
 * Hook for managing async function execution with state
 * @template T - The return type of the async function
 * @param asyncFunction - Async function to execute
 * @param deps - Dependency array for re-execution (default: [])
 * @param options - Configuration options
 * @returns Object containing data, loading, error, and execute method
 */
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps: any[] = [],
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = false, resetErrorOnRetry = true, resetDataOnRetry = false } = options

  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  const isMountedRef = useRef<boolean>(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      // Reset states if requested
      if (resetErrorOnRetry) setError(undefined)
      if (resetDataOnRetry) setData(undefined)

      setLoading(true)

      try {
        const result = await asyncFunction(...args)

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setData(result)
          setError(undefined)
          return result
        }
      } catch (err) {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          setData(undefined)
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }

      return undefined
    },
    [asyncFunction, resetErrorOnRetry, resetDataOnRetry]
  )

  const reset = useCallback(() => {
    setData(undefined)
    setError(undefined)
    setLoading(false)
  }, [])

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return {
    data,
    loading,
    error,
    execute,
    reset,
  }
}
