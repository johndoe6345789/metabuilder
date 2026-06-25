'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  PackageInfo,
  PackageListState,
  PackageListHandlers,
  UsePackagesReturn,
  PackageStatus,
  PackageError,
  PaginatedResponse,
} from '@/lib/types/package-admin-types'
import { PackageErrorCode } from '@/lib/types/package-admin-types'

/**
 * usePackages Hook
 *
 * Manages package list state with pagination, search, and filtering.
 * Handles fetching, debounced search, and status filtering.
 *
 * @param options - Configuration options
 * @returns Package list state and handlers
 *
 * @example
 * ```tsx
 * const { state, handlers, pagination } = usePackages({
 *   initialLimit: 10,
 *   debounceMs: 300,
 * })
 *
 * return (
 *   <div>
 *     <SearchInput
 *       value={state.search}
 *       onChange={handlers.searchPackages}
 *     />
 *     <PackageList
 *       packages={state.packages}
 *       loading={state.isLoading}
 *     />
 *     <Pagination
 *       page={pagination.page}
 *       total={pagination.pageCount}
 *       onPageChange={handlers.changePage}
 *     />
 *   </div>
 * )
 * ```
 */

interface UsePackagesOptions {
  /**
   * Base URL prefix for API calls (e.g. '/workflowui')
   */
  baseUrl?: string

  /**
   * Initial page limit
   * @default 10
   */
  initialLimit?: number

  /**
   * Debounce delay for search in milliseconds
   * @default 300
   */
  debounceMs?: number

  /**
   * Callback when fetch completes successfully
   */
  onSuccess?: (data: PackageInfo[]) => void

  /**
   * Callback when fetch fails
   */
  onError?: (error: PackageError) => void

  /**
   * Auto-refetch interval in milliseconds (null = no auto-refresh)
   * @default null
   */
  refetchInterval?: number | null

  /**
   * Refetch when window regains focus
   * @default true
   */
  refetchOnFocus?: boolean
}

/**
 * Create a structured PackageError from API response
 */
function createPackageError(
  statusCode: number,
  response: Record<string, unknown>
): PackageError {
  const message = (response.message as string) || 'Unknown error'
  const code = (response.code as PackageErrorCode) || PackageErrorCode.UNKNOWN_ERROR
  const details = (response.details as Record<string, unknown>) || {}

  const error = new Error(message) as PackageError
  error.code = code
  error.statusCode = statusCode
  error.details = details
  error.name = 'PackageError'

  return error
}

/**
 * Parse API error response
 */
async function parseApiError(response: Response): Promise<PackageError> {
  try {
    const data = (await response.json()) as Record<string, unknown>
    return createPackageError(response.status, data)
  } catch {
    const error = new Error(
      `HTTP ${response.status}: ${response.statusText}`
    ) as PackageError
    error.code = PackageErrorCode.NETWORK_ERROR
    error.statusCode = response.status
    error.name = 'PackageError'
    return error
  }
}

export function usePackages(options: UsePackagesOptions = {}): UsePackagesReturn {
  const {
    baseUrl = '',
    initialLimit = 10,
    debounceMs = 300,
    onSuccess,
    onError,
    refetchInterval = null,
    refetchOnFocus = true,
  } = options

  // State
  const [state, setState] = useState<PackageListState>({
    packages: [],
    total: 0,
    page: 0,
    limit: initialLimit,
    search: '',
    statusFilter: 'all',
    isLoading: false,
    isRefetching: false,
    error: null,
  })

  // Refs for debouncing and cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchQueueRef = useRef<string>('')

  /**
   * Fetch packages from API
   */
  const fetchPackagesInternal = useCallback(
    async (
      page: number = state.page,
      limit: number = state.limit,
      search: string = state.search,
      status: PackageStatus = state.statusFilter,
      isRefetch = false
    ): Promise<void> => {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        // Update loading state
        setState((prev) => ({
          ...prev,
          isLoading: !isRefetch,
          isRefetching: isRefetch,
          error: null,
        }))

        // Build query parameters
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
          ...(status !== 'all' && { status }),
        })

        const response = await fetch(`${baseUrl}/api/admin/packages?${params}`, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const error = await parseApiError(response)
          setState((prev) => ({ ...prev, error }))
          onError?.(error)
          return
        }

        const data = (await response.json()) as PaginatedResponse<PackageInfo>

        setState((prev) => ({
          ...prev,
          packages: data.items,
          total: data.total,
          page: data.page,
          limit: data.limit,
          error: null,
        }))

        onSuccess?.(data.items)
      } catch (err) {
        // Don't update state if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        const error = err instanceof Error ? err : new Error(String(err))
        const packageError = error as PackageError
        packageError.code = PackageErrorCode.NETWORK_ERROR
        packageError.name = 'PackageError'

        setState((prev) => ({ ...prev, error: packageError }))
        onError?.(packageError)
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefetching: false,
        }))
      }
    },
    [state.page, state.limit, state.search, state.statusFilter, onSuccess, onError]
  )

  /**
   * Public handler: Fetch packages with explicit parameters
   */
  const fetchPackages = useCallback(
    async (
      page?: number,
      limit?: number,
      search?: string,
      status?: PackageStatus
    ) => {
      await fetchPackagesInternal(page, limit, search, status, false)
    },
    [fetchPackagesInternal]
  )

  /**
   * Public handler: Refetch with current filters
   */
  const refetchPackages = useCallback(
    async () => {
      await fetchPackagesInternal(state.page, state.limit, state.search, state.statusFilter, true)
    },
    [state.page, state.limit, state.search, state.statusFilter, fetchPackagesInternal]
  )

  /**
   * Public handler: Debounced search
   */
  const searchPackages = useCallback((term: string) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Update search term immediately for UI
    setState((prev) => ({ ...prev, search: term }))

    // Queue search
    searchQueueRef.current = term

    // Debounce API call
    debounceTimerRef.current = setTimeout(async () => {
      if (searchQueueRef.current === term) {
        await fetchPackagesInternal(0, state.limit, term, state.statusFilter, false)
      }
    }, debounceMs)
  }, [state.limit, state.statusFilter, fetchPackagesInternal, debounceMs])

  /**
   * Public handler: Filter by status
   */
  const filterByStatus = useCallback(
    async (status: PackageStatus) => {
      await fetchPackagesInternal(0, state.limit, state.search, status, false)
    },
    [state.limit, state.search, fetchPackagesInternal]
  )

  /**
   * Public handler: Change page
   */
  const changePage = useCallback(
    async (page: number) => {
      if (page >= 0 && page < Math.ceil(state.total / state.limit)) {
        await fetchPackagesInternal(page, state.limit, state.search, state.statusFilter, false)
      }
    },
    [state.limit, state.search, state.statusFilter, state.total, fetchPackagesInternal]
  )

  /**
   * Public handler: Change limit
   */
  const changeLimit = useCallback(
    async (limit: number) => {
      await fetchPackagesInternal(0, limit, state.search, state.statusFilter, false)
    },
    [state.search, state.statusFilter, fetchPackagesInternal]
  )

  // Initial fetch
  useEffect(() => {
    void fetchPackagesInternal(0, initialLimit, '', 'all', false)
  }, []) // Only run once on mount

  // Auto-refetch on interval
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0) {
      return
    }

    const interval = setInterval(() => {
      void refetchPackages()
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, refetchPackages])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) {
      return
    }

    const handleFocus = () => {
      void refetchPackages()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, refetchPackages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const pagination = {
    page: state.page,
    limit: state.limit,
    total: state.total,
    pageCount: Math.ceil(state.total / state.limit),
  }

  const handlers: PackageListHandlers = {
    fetchPackages,
    refetchPackages,
    searchPackages,
    filterByStatus,
    changePage,
    changeLimit,
  }

  return {
    state,
    handlers,
    pagination,
  }
}
