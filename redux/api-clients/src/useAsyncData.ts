/**
 * useAsyncData - Generic async data fetching hook
 *
 * Delegates to Redux-backed @metabuilder/hooks-async for state management.
 * Maintains backward compatibility with previous standalone implementation.
 *
 * Manages async operations with loading states, error handling, retries, and refetching.
 * Works across all frontends for any async data source.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  useReduxAsyncData as useReduxAsyncDataImpl,
  useReduxPaginatedAsyncData as useReduxPaginatedAsyncDataImpl,
  useReduxMutation as useReduxMutationImpl,
} from '@metabuilder/hooks-async'

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
 * useAsyncData hook - Manage async data fetching with loading states
 *
 * Handles data fetching, loading state, error state, and automatic retries.
 * Perfect for client-side data loading with built-in loading UI feedback.
 *
 * Delegates to Redux-backed implementation via @metabuilder/hooks-async.
 *
 * @template T The type of data being fetched
 * @param fetchFn - Async function to fetch data
 * @param options - Configuration options
 * @returns Data, loading, error, and retry state
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
 *   <div>
 *     {isLoading && <LoadingSpinner />}
 *     {error && <ErrorBanner error={error} onRetry={retry} />}
 *     {data && <UserList users={data} />}
 *   </div>
 * )
 * ```
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

  // Track initial data locally for compatibility
  const [localData, setLocalData] = useState<T | undefined>(initialData)

  // Delegate to Redux-backed implementation
  const reduxResult = useReduxAsyncDataImpl<T>(fetchFn, {
    maxRetries: retries,
    retryDelay,
    refetchOnFocus,
    refetchInterval: refetchInterval ?? undefined,
    dependencies: Array.isArray(dependencies) ? [...dependencies] : [],
    onSuccess: (data) => {
      setLocalData(data as T)
      onSuccess?.(data as T)
    },
    onError: (error: string) => {
      // Convert error string to Error object for backward compatibility
      const errorObj = new Error(error)
      onError?.(errorObj)
    },
  })

  // Use local data if available, otherwise use Redux data
  const data = reduxResult.data ?? localData

  return {
    data,
    isLoading: reduxResult.isLoading,
    error: reduxResult.error ? new Error(reduxResult.error) : null,
    isRefetching: reduxResult.isRefetching,
    retry: reduxResult.retry,
    refetch: reduxResult.refetch,
  }
}

/**
 * usePaginatedData - Higher-order hook for paginated data
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
 * usePaginatedData - Hook for paginated API calls
 *
 * Delegates to Redux-backed implementation via @metabuilder/hooks-async.
 *
 * @template T Item type in the paginated result
 * @param fetchFn - Function that takes page and pageSize and returns items and total
 * @param options - Configuration options
 * @returns Paginated data with navigation
 *
 * @example
 * ```tsx
 * const paginated = usePaginatedData(
 *   async (page, pageSize) => {
 *     const res = await fetch(`/api/items?page=${page}&size=${pageSize}`)
 *     return res.json()
 *   },
 *   { pageSize: 20 }
 * )
 *
 * return (
 *   <div>
 *     <ItemList items={paginated.data} />
 *     <Pagination
 *       page={paginated.page}
 *       pageCount={paginated.pageCount}
 *       onNext={paginated.nextPage}
 *       onPrevious={paginated.previousPage}
 *     />
 *   </div>
 * )
 * ```
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ items: T[]; total: number }>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataResult<T> {
  const { pageSize = 10, initialPage = 0, ...asyncOptions } = options

  // Track pagination locally - convert from 0-based to 1-based for Redux hook
  const [page, setPage] = useState(initialPage)
  const [itemCount, setItemCount] = useState(0)

  // Create a mutable copy of dependencies for the Redux hook
  const deps = asyncOptions.dependencies ? Array.isArray(asyncOptions.dependencies) ? [...asyncOptions.dependencies] : [asyncOptions.dependencies] : []

  // Delegate to Redux-backed paginated implementation
  // Note: Redux hook uses 1-based pages, convert our 0-based page
  const reduxResult = useReduxPaginatedAsyncDataImpl<T>(
    (reduxPage: number, reduxPageSize: number) => {
      // Convert from Redux 1-based to API 0-based (or keep as-is based on your API)
      return fetchFn(reduxPage - 1, reduxPageSize).then((result) => {
        setItemCount(result.total)
        return result.items
      })
    },
    {
      pageSize,
      initialPage: page + 1, // Convert 0-based to 1-based for Redux hook
      dependencies: deps,
      maxRetries: asyncOptions.retries,
      retryDelay: asyncOptions.retryDelay,
      refetchOnFocus: asyncOptions.refetchOnFocus,
      refetchInterval: (asyncOptions.refetchInterval ?? null) ?? undefined,
      onSuccess: asyncOptions.onSuccess as ((data: unknown) => void) | undefined,
      onError: (error: string) => {
        // Convert error string to Error object for backward compatibility
        const errorObj = new Error(error)
        asyncOptions.onError?.(errorObj)
      },
    }
  )

  const pageCount = Math.ceil(itemCount / pageSize)

  return {
    data: reduxResult.data || [],
    isLoading: reduxResult.isLoading,
    error: reduxResult.error ? new Error(reduxResult.error) : null,
    isRefetching: reduxResult.isRefetching,
    retry: reduxResult.retry,
    refetch: reduxResult.refetch,
    page,
    pageCount,
    itemCount,
    goToPage: (newPage: number) => {
      if (newPage >= 0 && newPage < pageCount) {
        setPage(newPage)
        reduxResult.goToPage(newPage + 1) // Convert to 1-based
      }
    },
    nextPage: () => {
      if (page < pageCount - 1) {
        const newPage = page + 1
        setPage(newPage)
        reduxResult.nextPage()
      }
    },
    previousPage: () => {
      if (page > 0) {
        const newPage = page - 1
        setPage(newPage)
        reduxResult.prevPage()
      }
    },
  }
}

/**
 * useMutation - Hook for mutations (POST, PUT, DELETE) with loading state
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
 * useMutation - Hook for write operations with loading state
 *
 * Delegates to Redux-backed implementation via @metabuilder/hooks-async.
 *
 * @template T Input data type for the mutation
 * @template R Return type of the mutation
 * @param mutationFn - Function that executes the mutation
 * @param options - Configuration options
 * @returns Mutation executor and state
 *
 * @example
 * ```tsx
 * const { mutate, isLoading, error } = useMutation(
 *   async (user) => {
 *     const res = await fetch('/api/users', { method: 'POST', body: JSON.stringify(user) })
 *     return res.json()
 *   },
 *   { onSuccess: (result) => console.log('Created:', result) }
 * )
 *
 * const handleSubmit = async (data) => {
 *   try {
 *     const result = await mutate(data)
 *   } catch (err) {
 *     console.error('Failed:', err)
 *   }
 * }
 * ```
 */
export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>,
  options: UseMutationOptions<T, R> = {}
): UseMutationResult<T, R> {
  const { onSuccess, onError } = options

  // Delegate to Redux-backed implementation
  const reduxResult = useReduxMutationImpl<T, R>(mutationFn, {
    onSuccess,
    onError: (error: string) => {
      // Convert error string to Error object for backward compatibility
      const errorObj = new Error(error)
      onError?.(errorObj)
    },
  })

  return {
    mutate: reduxResult.mutate,
    isLoading: reduxResult.isLoading,
    error: reduxResult.error ? new Error(reduxResult.error) : null,
    reset: reduxResult.reset,
  }
}
