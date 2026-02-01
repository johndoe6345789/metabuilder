/**
 * Redux-backed async data hook
 * Drop-in replacement for useAsyncData / TanStack React Query
 *
 * Provides:
 * - Data fetching with automatic caching
 * - Request deduplication
 * - Automatic retry logic
 * - Manual refetch capability
 * - Loading and error states
 */

import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAsyncData,
  refetchAsyncData,
  selectAsyncRequest,
  type AsyncDataState,
} from '@metabuilder/redux-slices'

export interface UseAsyncDataOptions {
  /** Maximum number of retries (default: 3) */
  maxRetries?: number
  /** Delay between retries in ms (default: 1000) */
  retryDelay?: number
  /** Called on successful data fetch */
  onSuccess?: (data: unknown) => void
  /** Called on error */
  onError?: (error: string) => void
  /** Enable automatic refetch on interval (ms) */
  refetchInterval?: number | null
  /** Refetch when window regains focus */
  refetchOnFocus?: boolean
  /** Dependencies to trigger refetch */
  dependencies?: unknown[]
}

export interface UseAsyncDataResult<T = unknown> {
  /** The fetched data */
  data: T | undefined
  /** True if currently fetching */
  isLoading: boolean
  /** True if refetching without clearing data */
  isRefetching: boolean
  /** Error message if fetch failed */
  error: string | null
  /** Manually retry the fetch */
  retry: () => Promise<void>
  /** Manually refetch data */
  refetch: () => Promise<void>
}

/**
 * Hook for fetching async data with Redux backing
 * Compatible with @tanstack/react-query API
 */
export function useReduxAsyncData<T = unknown>(
  fetchFn: () => Promise<T>,
  options?: UseAsyncDataOptions
): UseAsyncDataResult<T> {
  const dispatch = useDispatch()
  const requestIdRef = useRef<string>('')
  const refetchIntervalRef = useRef<NodeJS.Timeout>()
  const visibilityListenerRef = useRef<(() => void) | null>(null)

  // Generate stable request ID based on fetch function
  if (!requestIdRef.current) {
    requestIdRef.current = `async-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  const requestId = requestIdRef.current
  const asyncState = useSelector((state: { asyncData: AsyncDataState }) =>
    selectAsyncRequest(state, requestId)
  )

  // Extract status from request or use defaults
  const status = asyncState?.status ?? 'idle'
  const data = (asyncState?.data ?? undefined) as T | undefined
  const error = asyncState?.error ?? null
  const isRefetching = asyncState?.isRefetching ?? false

  const isLoading = status === 'pending' && !isRefetching
  const retryCount = asyncState?.retryCount ?? 0
  const maxRetries = options?.maxRetries ?? 3

  // Check if should retry on error
  const shouldRetry = status === 'failed' && retryCount < maxRetries

  // Initial fetch on mount/dependency change
  useEffect(() => {
    // Only fetch if idle or if we should retry
    if (status === 'idle' || shouldRetry) {
      void (dispatch as any)(
        fetchAsyncData({
          id: requestId,
          fetchFn,
          maxRetries: options?.maxRetries,
          retryDelay: options?.retryDelay,
        })
      )
    }
  }, [
    requestId,
    status,
    shouldRetry,
    fetchFn,
    dispatch,
    options?.maxRetries,
    options?.retryDelay,
    ...(options?.dependencies ?? []),
  ])

  // Call success callback when data arrives
  useEffect(() => {
    if (status === 'succeeded' && data !== undefined && options?.onSuccess) {
      options.onSuccess(data)
    }
  }, [status, data, options])

  // Call error callback when error occurs
  useEffect(() => {
    if (status === 'failed' && error && options?.onError) {
      options.onError(error)
    }
  }, [status, error, options])

  // Handle refetch on visibility/focus
  useEffect(() => {
    if (options?.refetchOnFocus) {
      visibilityListenerRef.current = () => {
        if (document.visibilityState === 'visible') {
          void refetch()
        }
      }
      document.addEventListener('visibilitychange', visibilityListenerRef.current)

      return () => {
        if (visibilityListenerRef.current) {
          document.removeEventListener('visibilitychange', visibilityListenerRef.current)
        }
      }
    }
  }, [])

  // Manual refetch function
  const refetch = useCallback(async () => {
    return (dispatch as any)(
      refetchAsyncData({
        id: requestId,
        fetchFn,
      })
    )
  }, [requestId, fetchFn, dispatch])

  // Manual retry function
  const retry = useCallback(() => {
    return refetch()
  }, [refetch])

  return {
    data,
    isLoading,
    error,
    isRefetching,
    retry,
    refetch,
  }
}

/**
 * Paginated variant of useReduxAsyncData
 * Handles pagination state and concatenation of results
 */
export interface UsePaginatedAsyncDataOptions extends UseAsyncDataOptions {
  /** Items per page */
  pageSize?: number
  /** Start page (default: 1) */
  initialPage?: number
}

export interface UsePaginatedAsyncDataResult<T = unknown>
  extends UseAsyncDataResult<T[]> {
  /** Current page number */
  currentPage: number
  /** Move to next page */
  nextPage: () => void
  /** Move to previous page */
  prevPage: () => void
  /** Go to specific page */
  goToPage: (page: number) => void
  /** Total pages (if available) */
  totalPages?: number
}

export function useReduxPaginatedAsyncData<T = unknown>(
  fetchFn: (page: number, pageSize: number) => Promise<T[]>,
  options?: UsePaginatedAsyncDataOptions
): UsePaginatedAsyncDataResult<T> {
  const pageSize = options?.pageSize ?? 20
  const initialPage = options?.initialPage ?? 1

  const pageRef = useRef(initialPage)
  const allDataRef = useRef<T[]>([])

  // Fetch current page
  const { data, isLoading, error, isRefetching, refetch } = useReduxAsyncData(
    () => fetchFn(pageRef.current, pageSize),
    {
      ...options,
      onSuccess: (pageData) => {
        // Append new data to existing
        if (Array.isArray(pageData)) {
          allDataRef.current = [
            ...allDataRef.current.slice(0, (pageRef.current - 1) * pageSize),
            ...pageData,
          ]
        }
        options?.onSuccess?.(pageData)
      },
    }
  )

  const nextPage = useCallback(() => {
    pageRef.current += 1
    void refetch()
  }, [refetch])

  const prevPage = useCallback(() => {
    if (pageRef.current > 1) {
      pageRef.current -= 1
      void refetch()
    }
  }, [refetch])

  const goToPage = useCallback(
    (page: number) => {
      pageRef.current = Math.max(1, page)
      void refetch()
    },
    [refetch]
  )

  return {
    data: data || [],
    isLoading,
    error,
    isRefetching,
    retry: () => refetch(),
    refetch,
    currentPage: pageRef.current,
    nextPage,
    prevPage,
    goToPage,
  }
}
