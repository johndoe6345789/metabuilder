'use client'

import { useCallback, useRef, useState } from 'react'
import type {
  PackageInfo,
  PackageDetailsState,
  PackageDetailsHandlers,
  UsePackageDetailsReturn,
  PackageError,
} from '@/lib/types/package-admin-types'
import { PackageErrorCode } from '@/lib/types/package-admin-types'

/**
 * usePackageDetails Hook
 *
 * Manages package detail modal state (open/close, loading, data).
 * Handles fetching individual package information for display in modal.
 *
 * @param options - Configuration options
 * @returns Package details state and handlers
 *
 * @example
 * ```tsx
 * const { state, handlers } = usePackageDetails()
 *
 * return (
 *   <>
 *     <PackageList
 *       onViewDetails={(id) => handlers.openDetails(id)}
 *     />
 *     {state.isOpen && (
 *       <PackageDetailModal
 *         package={state.selectedPackage}
 *         loading={state.isLoading}
 *         onClose={handlers.closeDetails}
 *       />
 *     )}
 *   </>
 * )
 * ```
 */

interface UsePackageDetailsOptions {
  /**
   * Base URL prefix for API calls (e.g. '/workflowui')
   */
  baseUrl?: string

  /**
   * Callback when details load successfully
   */
  onSuccess?: (pkg: PackageInfo) => void

  /**
   * Callback when details fail to load
   */
  onError?: (error: PackageError) => void
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

export function usePackageDetails(
  options: UsePackageDetailsOptions = {}
): UsePackageDetailsReturn {
  const { baseUrl = '', onSuccess, onError } = options

  // State
  const [state, setState] = useState<PackageDetailsState>({
    selectedPackage: null,
    isOpen: false,
    isLoading: false,
    error: null,
  })

  // Track abort controller
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * Open details modal and fetch package info
   */
  const openDetails = useCallback(
    async (packageId: string): Promise<void> => {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        setState((prev) => ({
          ...prev,
          isOpen: true,
          isLoading: true,
          error: null,
        }))

        const response = await fetch(`${baseUrl}/api/admin/packages/${packageId}`, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const error = await parseApiError(response)
          setState((prev) => ({
            ...prev,
            error,
            isLoading: false,
          }))
          onError?.(error)
          return
        }

        const pkg = (await response.json()) as PackageInfo

        setState((prev) => ({
          ...prev,
          selectedPackage: pkg,
          isLoading: false,
          error: null,
        }))

        onSuccess?.(pkg)
      } catch (err) {
        // Don't update state if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        const error = err instanceof Error ? err : new Error(String(err))
        const packageError = error as PackageError
        packageError.code = PackageErrorCode.NETWORK_ERROR
        packageError.name = 'PackageError'

        setState((prev) => ({
          ...prev,
          error: packageError,
          isLoading: false,
        }))
        onError?.(packageError)
      }
    },
    [onSuccess, onError]
  )

  /**
   * Close details modal
   */
  const closeDetails = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setState((prev) => ({
      ...prev,
      isOpen: false,
      selectedPackage: null,
      error: null,
    }))
  }, [])

  /**
   * Refresh details for currently selected package
   */
  const refreshDetails = useCallback(async (): Promise<void> => {
    if (!state.selectedPackage) {
      return
    }

    try {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }))

      const response = await fetch(
        `/api/admin/packages/${state.selectedPackage.id}`,
        {
          signal: abortControllerRef.current.signal,
        }
      )

      if (!response.ok) {
        const error = await parseApiError(response)
        setState((prev) => ({
          ...prev,
          error,
          isLoading: false,
        }))
        onError?.(error)
        return
      }

      const pkg = (await response.json()) as PackageInfo

      setState((prev) => ({
        ...prev,
        selectedPackage: pkg,
        isLoading: false,
        error: null,
      }))

      onSuccess?.(pkg)
    } catch (err) {
      // Don't update state if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const error = err instanceof Error ? err : new Error(String(err))
      const packageError = error as PackageError
      packageError.code = PackageErrorCode.NETWORK_ERROR
      packageError.name = 'PackageError'

      setState((prev) => ({
        ...prev,
        error: packageError,
        isLoading: false,
      }))
      onError?.(packageError)
    }
  }, [state.selectedPackage, onSuccess, onError])

  const handlers: PackageDetailsHandlers = {
    openDetails,
    closeDetails,
    refreshDetails,
  }

  return {
    state,
    handlers,
  }
}
