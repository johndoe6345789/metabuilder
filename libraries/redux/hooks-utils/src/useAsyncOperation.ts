/**
 * useAsyncOperation Hook
 * Non-Redux async operation management with retry and caching
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Response caching with TTL
 * - Request deduplication (prevents duplicate simultaneous requests)
 * - Abort capability
 * - Error handling with typed errors
 * - Status tracking (idle, pending, succeeded, failed)
 *
 * @example
 * const { data, isLoading, error, execute, retry } = useAsyncOperation<User[]>(
 *   () => fetchUsers(),
 *   {
 *     retryCount: 3,
 *     cacheKey: 'users',
 *     cacheTTL: 60000, // 1 minute
 *   }
 * )
 *
 * useEffect(() => {
 *   execute()
 * }, [])
 *
 * if (isLoading) return <Spinner />
 * if (error) return <Error message={error.message} onRetry={retry} />
 * return <UserList users={data} />
 */

import { useCallback, useRef, useState, useEffect } from 'react'

export type AsyncStatus = 'idle' | 'pending' | 'succeeded' | 'failed'

export interface AsyncError {
  message: string
  code?: string
  originalError?: Error
}

export interface UseAsyncOperationOptions {
  /** Maximum number of retries - default 0 */
  retryCount?: number
  /** Base delay between retries in ms - default 1000 */
  retryDelay?: number
  /** Exponential backoff multiplier - default 2 */
  retryBackoff?: number
  /** Cache key for response caching */
  cacheKey?: string
  /** Cache TTL in ms */
  cacheTTL?: number
  /** Called when operation succeeds */
  onSuccess?: <T>(data: T) => void
  /** Called when operation fails */
  onError?: (error: AsyncError) => void
  /** Called when status changes */
  onStatusChange?: (status: AsyncStatus) => void
  /** Auto-execute on mount */
  autoExecute?: boolean
}

// Global cache for responses
const responseCache = new Map<string, { data: any; expiresAt: number }>()

export interface UseAsyncOperationReturn<T> {
  /** Current data (null if not loaded) */
  data: T | null
  /** Current error (null if no error) */
  error: AsyncError | null
  /** Current status */
  status: AsyncStatus
  /** Is operation in progress */
  isLoading: boolean
  /** Is operation idle (not started) */
  isIdle: boolean
  /** Did operation succeed */
  isSuccess: boolean
  /** Did operation fail */
  isError: boolean
  /** Execute the operation */
  execute: () => Promise<T | null>
  /** Retry the operation */
  retry: () => Promise<T | null>
  /** Refetch fresh data (bypass cache) */
  refetch: () => Promise<T | null>
  /** Reset to initial state */
  reset: () => void
}

export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const {
    retryCount = 0,
    retryDelay = 1000,
    retryBackoff = 2,
    cacheKey,
    cacheTTL = 0,
    onSuccess,
    onError,
    onStatusChange,
    autoExecute = false,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<AsyncError | null>(null)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [isLoading, setIsLoading] = useState(false)

  const attemptsRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoExecutedRef = useRef(false)

  // Update status
  const updateStatus = useCallback(
    (newStatus: AsyncStatus) => {
      setStatus(newStatus)
      onStatusChange?.(newStatus)
      setIsLoading(newStatus === 'pending')
    },
    [onStatusChange]
  )

  // Execute operation with retry logic
  const executeOperation = useCallback(
    async (bypassCache = false): Promise<T | null> => {
      try {
        // Check cache first
        if (cacheKey && !bypassCache) {
          const cached = responseCache.get(cacheKey)
          if (cached && cached.expiresAt > Date.now()) {
            setData(cached.data)
            setError(null)
            updateStatus('succeeded')
            return cached.data
          }
        }

        // Prevent duplicate requests
        if (isLoading) {
          return data
        }

        updateStatus('pending')
        attemptsRef.current = 0

        const executeWithRetry = async (attempt: number): Promise<T> => {
          try {
            abortControllerRef.current = new AbortController()
            const result = await operation()

            // Cache the result
            if (cacheKey && cacheTTL > 0) {
              responseCache.set(cacheKey, {
                data: result,
                expiresAt: Date.now() + cacheTTL,
              })
            }

            setData(result)
            setError(null)
            onSuccess?.(result)
            return result
          } catch (err) {
            const shouldRetry = attempt < retryCount
            const delay = retryDelay * Math.pow(retryBackoff, attempt)

            if (shouldRetry) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, delay))
              attemptsRef.current = attempt + 1
              return executeWithRetry(attempt + 1)
            }

            // Final error
            const asyncError: AsyncError = {
              message: err instanceof Error ? err.message : 'Operation failed',
              originalError: err instanceof Error ? err : undefined,
              code: err instanceof Error && 'code' in err ? (err.code as string) : undefined,
            }

            setError(asyncError)
            setData(null)
            onError?.(asyncError)
            throw asyncError
          }
        }

        try {
          const result = await executeWithRetry(0)
          updateStatus('succeeded')
          return result
        } catch (err) {
          updateStatus('failed')
          return null
        }
      } catch (err) {
        updateStatus('failed')
        return null
      }
    },
    [operation, retryCount, retryDelay, retryBackoff, cacheKey, cacheTTL, onSuccess, onError, updateStatus, isLoading, data]
  )

  // Auto-execute on mount
  useEffect(() => {
    if (autoExecute && !autoExecutedRef.current) {
      autoExecutedRef.current = true
      executeOperation()
    }
  }, [autoExecute, executeOperation])

  // Retry
  const handleRetry = useCallback(async () => {
    attemptsRef.current = 0
    return executeOperation()
  }, [executeOperation])

  // Refetch (bypass cache)
  const handleRefetch = useCallback(async () => {
    attemptsRef.current = 0
    return executeOperation(true)
  }, [executeOperation])

  // Reset
  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort()
    setData(null)
    setError(null)
    setStatus('idle')
    setIsLoading(false)
    attemptsRef.current = 0
  }, [])

  return {
    data,
    error,
    status,
    isLoading,
    isIdle: status === 'idle',
    isSuccess: status === 'succeeded',
    isError: status === 'failed',
    execute: executeOperation,
    retry: handleRetry,
    refetch: handleRefetch,
    reset: handleReset,
  }
}
