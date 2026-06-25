'use client'

import { useCallback, useRef, useState } from 'react'
import type {
  PackageInfo,
  PackageActionsState,
  PackageActionHandlers,
  UsePackageActionsReturn,
  PackageError,
} from '@/lib/types/package-admin-types'
import { PackageErrorCode } from '@/lib/types/package-admin-types'

/**
 * usePackageActions Hook
 *
 * Manages individual package operations (install, uninstall, enable, disable).
 * Tracks operation loading states and prevents duplicate operations.
 *
 * @param options - Configuration options
 * @returns Package action handlers and state
 *
 * @example
 * ```tsx
 * const { handlers, state, isOperationInProgress } = usePackageActions({
 *   onSuccess: (package) => {
 *     showToast(`${package.name} installed successfully`)
 *     refetchList()
 *   },
 * })
 *
 * return (
 *   <button
 *     disabled={isOperationInProgress(packageId)}
 *     onClick={() => handlers.installPackage(packageId)}
 *   >
 *     {isOperationInProgress(packageId) ? 'Installing...' : 'Install'}
 *   </button>
 * )
 * ```
 */

interface UsePackageActionsOptions {
  /**
   * Base URL prefix for API calls (e.g. '/workflowui')
   */
  baseUrl?: string

  /**
   * Callback when operation completes successfully
   */
  onSuccess?: (
    pkg: PackageInfo,
    operation: 'install' | 'uninstall' | 'enable' | 'disable'
  ) => void

  /**
   * Callback when operation fails
   */
  onError?: (error: PackageError, packageId: string) => void
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

export function usePackageActions(
  options: UsePackageActionsOptions = {}
): UsePackageActionsReturn {
  const { baseUrl = '', onSuccess, onError } = options

  // State
  const [state, setState] = useState<PackageActionsState>({
    isLoading: false,
    operationInProgress: new Set(),
    error: null,
  })

  // Track abort controllers per operation
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  /**
   * Execute a package operation with error handling
   */
  const executeOperation = useCallback(
    async <T extends Record<string, unknown>>(
      operationName: string,
      packageId: string,
      fetchFn: (signal: AbortSignal) => Promise<Response>,
      onSuccessFn?: (data: T) => void
    ): Promise<T> => {
      // Check if operation already in progress
      if (state.operationInProgress.has(packageId)) {
        throw new Error('Operation already in progress for this package')
      }

      try {
        // Cancel previous operation for this package if exists
        const previousController = abortControllersRef.current.get(packageId)
        if (previousController) {
          previousController.abort()
        }

        // Create new abort controller
        const abortController = new AbortController()
        abortControllersRef.current.set(packageId, abortController)

        // Mark operation in progress
        setState((prev) => ({
          ...prev,
          isLoading: true,
          operationInProgress: new Set([...prev.operationInProgress, packageId]),
          error: null,
        }))

        // Execute operation
        const response = await fetchFn(abortController.signal)

        if (!response.ok) {
          const error = await parseApiError(response)
          setState((prev) => ({
            ...prev,
            error,
            operationInProgress: new Set(
              [...prev.operationInProgress].filter((id) => id !== packageId)
            ),
          }))
          onError?.(error, packageId)
          throw error
        }

        const data = (await response.json()) as T

        // Operation successful
        setState((prev) => ({
          ...prev,
          error: null,
          operationInProgress: new Set(
            [...prev.operationInProgress].filter((id) => id !== packageId)
          ),
        }))

        onSuccessFn?.(data)
        onSuccess?.(data as unknown as PackageInfo, operationName as 'install' | 'uninstall' | 'enable' | 'disable')

        return data
      } catch (err) {
        // Don't update state if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return {} as T
        }

        const error = err instanceof Error ? (err as PackageError) : new Error(String(err))
        if (!(error as PackageError).code) {
          ;(error as PackageError).code = PackageErrorCode.NETWORK_ERROR
          ;(error as PackageError).name = 'PackageError'
        }

        setState((prev) => ({
          ...prev,
          error: error as PackageError,
          operationInProgress: new Set(
            [...prev.operationInProgress].filter((id) => id !== packageId)
          ),
        }))

        onError?.(error as PackageError, packageId)
        throw error
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [state.operationInProgress, onSuccess, onError]
  )

  /**
   * Install package
   */
  const installPackage = useCallback(
    async (packageId: string): Promise<PackageInfo> => {
      return executeOperation(
        'install',
        packageId,
        async (signal) => {
          return fetch(`${baseUrl}/api/admin/packages/${packageId}/install`, {
            method: 'POST',
            signal,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      )
    },
    [executeOperation]
  )

  /**
   * Uninstall package
   */
  const uninstallPackage = useCallback(
    async (packageId: string): Promise<void> => {
      await executeOperation(
        'uninstall',
        packageId,
        async (signal) => {
          return fetch(`${baseUrl}/api/admin/packages/${packageId}/uninstall`, {
            method: 'POST',
            signal,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      )
    },
    [executeOperation]
  )

  /**
   * Enable package
   */
  const enablePackage = useCallback(
    async (packageId: string): Promise<PackageInfo> => {
      return executeOperation(
        'enable',
        packageId,
        async (signal) => {
          return fetch(`${baseUrl}/api/admin/packages/${packageId}/enable`, {
            method: 'POST',
            signal,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      )
    },
    [executeOperation]
  )

  /**
   * Disable package
   */
  const disablePackage = useCallback(
    async (packageId: string): Promise<PackageInfo> => {
      return executeOperation(
        'disable',
        packageId,
        async (signal) => {
          return fetch(`${baseUrl}/api/admin/packages/${packageId}/disable`, {
            method: 'POST',
            signal,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      )
    },
    [executeOperation]
  )

  const handlers: PackageActionHandlers = {
    installPackage,
    uninstallPackage,
    enablePackage,
    disablePackage,
  }

  const isOperationInProgress = (packageId: string): boolean => {
    return state.operationInProgress.has(packageId)
  }

  return {
    state,
    handlers,
    isOperationInProgress,
  }
}
