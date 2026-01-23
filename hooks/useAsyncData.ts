'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * useAsyncData Hook - Manage async data fetching with loading states
 *
 * Handles data fetching, loading state, error state, and automatic retries.
 * Perfect for client-side data loading with built-in loading UI feedback.
 *
 * @template T The type of data being fetched
 *
 * @param {() => Promise<T>} fetchFn - Async function to fetch data
 * @param {UseAsyncDataOptions<T>} options - Configuration options
 * @returns {UseAsyncDataResult<T>} Data, loading, error, and retry state
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, retry } = useAsyncData(
 *   async () => {
 *     const res = await fetch('/api/users')
 *     return res.json()
 *   },
 *   { dependencies: [userId] }
 * )
 *
 * return (
 *   <LoadingSkeleton isLoading={isLoading} error={error}>
 *     {data && <UserList users={data} />}
 *   </LoadingSkeleton>
 * )
 * ```
 */

export interface UseAsyncDataOptions<T> {
  /**
   * Dependencies array - refetch when dependencies change
   * @default []
   */
  dependencies?: React.DependencyList

  /**
   * Callback when data successfully loads
   */
  onSuccess?: (data: T) => void

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void

  /**
   * Number of times to retry on failure
   * @default 0
   */
  retries?: number

  /**
   * Delay before retry in milliseconds
   * @default 1000
   */
  retryDelay?: number

  /**
   * Whether to refetch when window regains focus
   * @default true
   */
  refetchOnFocus?: boolean

  /**
   * Refetch interval in milliseconds (null = no auto-refetch)
   * @default null
   */
  refetchInterval?: number | null

  /**
   * Initial data value before first fetch
   * @default undefined
   */
  initialData?: T
}

export interface UseAsyncDataResult<T> {
  /**
   * The fetched data
   */
  data: T | undefined

  /**
   * Whether data is currently loading
   */
  isLoading: boolean

  /**
   * Error that occurred, if any
   */
  error: Error | null

  /**
   * Whether a refetch is in progress
   */
  isRefetching: boolean

  /**
   * Manually retry the fetch
   */
  retry: () => Promise<void>

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

/**
 * useAsyncData Hook Implementation
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const {
    dependencies = [],
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
    refetchOnFocus = true,
    refetchInterval = null,
    initialData,
  } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const retryCountRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (isRetry = false) => {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController()

        if (isRetry) {
          setIsRefetching(true)
        } else {
          setIsLoading(true)
        }
        setError(null)

        const result = await fetchFn()
        setData(result)
        setError(null)
        retryCountRef.current = 0

        if (onSuccess) {
          onSuccess(result)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))

        // Don't update state if this request was aborted
        if (error.name === 'AbortError') {
          return
        }

        setError(error)

        // Retry logic
        if (retryCountRef.current < retries) {
          retryCountRef.current += 1
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          await fetchData(isRetry)
        } else if (onError) {
          onError(error)
        }
      } finally {
        setIsLoading(false)
        setIsRefetching(false)
      }
    },
    [fetchFn, retries, retryDelay, onSuccess, onError]
  )

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refetch on interval
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0) {
      return
    }

    const interval = setInterval(() => {
      void fetchData(true)
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) {
      return
    }

    const handleFocus = () => {
      void fetchData(true)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    isRefetching,
    retry: () => fetchData(true),
    refetch: () => fetchData(true),
  }
}

/**
 * Higher-order hook for paginated data
 */
export interface UsePaginatedDataOptions<T> extends UseAsyncDataOptions<T[]> {
  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number

  /**
   * Initial page number (0-based)
   * @default 0
   */
  initialPage?: number
}

export interface UsePaginatedDataResult<T> extends UseAsyncDataResult<T[]> {
  /**
   * Current page number (0-based)
   */
  page: number

  /**
   * Total number of pages
   */
  pageCount: number

  /**
   * Go to specific page
   */
  goToPage: (page: number) => void

  /**
   * Go to next page
   */
  nextPage: () => void

  /**
   * Go to previous page
   */
  previousPage: () => void

  /**
   * Total item count
   */
  itemCount: number
}

/**
 * usePaginatedData Hook for paginated API calls
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataResult<T> {
  const { pageSize = 10, initialPage = 0, ...asyncOptions } = options

  const [page, setPage] = useState(initialPage)
  const [itemCount, setItemCount] = useState(0)

  const asyncResult = useAsyncData(
    async () => {
      const result = await fetchFn(page, pageSize)
      setItemCount(result.total)
      return result.items
    },
    {
      ...asyncOptions,
      dependencies: [page, pageSize, ...(asyncOptions.dependencies ?? [])],
    }
  )

  const pageCount = Math.ceil(itemCount / pageSize)

  return {
    ...asyncResult,
    page,
    pageCount,
    itemCount,
    goToPage: (newPage: number) => {
      if (newPage >= 0 && newPage < pageCount) {
        setPage(newPage)
      }
    },
    nextPage: () => {
      if (page < pageCount - 1) {
        setPage(page + 1)
      }
    },
    previousPage: () => {
      if (page > 0) {
        setPage(page - 1)
      }
    },
  }
}

/**
 * Hook for mutations (POST, PUT, DELETE) with loading state
 */
export interface UseMutationOptions<T, R> {
  /**
   * Callback on success
   */
  onSuccess?: (data: R) => void

  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

export interface UseMutationResult<T, R> {
  /**
   * Execute the mutation
   */
  mutate: (data: T) => Promise<R>

  /**
   * Whether mutation is in progress
   */
  isLoading: boolean

  /**
   * Error that occurred, if any
   */
  error: Error | null

  /**
   * Reset error state
   */
  reset: () => void
}

/**
 * useMutation Hook for write operations
 */
export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>,
  options: UseMutationOptions<T, R> = {}
): UseMutationResult<T, R> {
  const { onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (data: T) => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await mutationFn(data)

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)

        if (onError) {
          onError(error)
        }

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, onSuccess, onError]
  )

  return {
    mutate,
    isLoading,
    error,
    reset: () => setError(null),
  }
}
