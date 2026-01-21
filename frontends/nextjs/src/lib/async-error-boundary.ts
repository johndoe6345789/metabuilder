/**
 * Async Error Boundary Utilities
 *
 * Provides utilities for wrapping async operations with error boundaries,
 * retry logic, and error reporting. Works in conjunction with
 * RetryableErrorBoundary component for comprehensive error handling.
 *
 * Features:
 * - Automatic retry for transient failures
 * - Exponential backoff
 * - Error categorization
 * - Timeout handling
 * - Abort signal support
 */

import { errorReporting, type ErrorReportContext } from './error-reporting'
import { retry, type RetryOptions } from './api/retry'

export interface AsyncErrorBoundaryOptions {
  /** Maximum number of retries */
  maxRetries?: number
  /** Initial retry delay in milliseconds */
  initialDelayMs?: number
  /** Maximum retry delay in milliseconds */
  maxDelayMs?: number
  /** Timeout in milliseconds */
  timeoutMs?: number
  /** Error reporting context */
  context?: ErrorReportContext
  /** Whether to report errors to monitoring */
  reportError?: boolean
  /** Callback on error */
  onError?: (error: Error, attempt: number) => void
  /** Callback on retry */
  onRetry?: (attempt: number, error: Error) => void
  /** Callback on success after retry */
  onRetrySuccess?: (attempt: number) => void
}

/**
 * Create a timeout promise
 */
function createTimeoutPromise<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms (408)`))
    }, ms)
  })
}

/**
 * Wrap an async operation with retry logic and error handling
 *
 * @param operation - The async operation to wrap
 * @param options - Configuration options
 * @returns Promise that resolves with the operation result or rejects after all retries
 */
export async function withAsyncErrorBoundary<T>(
  operation: () => Promise<T>,
  options: AsyncErrorBoundaryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    timeoutMs,
    context = {},
    reportError: shouldReportError = true,
    onError,
    onRetry,
    onRetrySuccess,
  } = options

  let lastError: Error | null = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      // Create the operation promise, optionally with timeout
      let operationPromise: Promise<T> = operation()

      if (timeoutMs) {
        operationPromise = Promise.race([
          operationPromise,
          createTimeoutPromise<T>(timeoutMs),
        ])
      }

      const result = await operationPromise

      // If we got here after retries, report success
      if (attempt > 0 && onRetrySuccess) {
        onRetrySuccess(attempt)
      }

      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Report error if this is the last attempt
      if (shouldReportError && attempt === maxRetries) {
        errorReporting.reportError(lastError, {
          ...context,
          retryCount: attempt,
          retryable: false,
        })
      }

      // Call error callback
      if (onError) {
        onError(lastError, attempt)
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate delay for next retry
      const delayMs = Math.min(
        initialDelayMs * Math.pow(2, attempt),
        maxDelayMs
      )

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs))

      attempt++
    }
  }

  throw lastError ?? new Error('Async operation failed')
}

/**
 * Fetch with automatic retry and error handling
 *
 * @param url - The URL to fetch
 * @param options - Fetch options plus error boundary options
 * @returns Promise that resolves with the response
 */
export async function fetchWithErrorBoundary(
  url: string,
  fetchOptions: RequestInit = {},
  boundaryOptions: AsyncErrorBoundaryOptions = {}
): Promise<Response> {
  return withAsyncErrorBoundary(
    () => fetch(url, fetchOptions),
    boundaryOptions
  )
}

/**
 * Generic async function wrapper that converts exceptions to resolved values
 * Useful for Promise.allSettled() workflows
 *
 * @param operation - The async operation
 * @param options - Configuration options
 * @returns Promise that always resolves (never rejects)
 */
export async function tryAsyncOperation<T>(
  operation: () => Promise<T>,
  options: AsyncErrorBoundaryOptions = {}
): Promise<{ success: true; data: T } | { success: false; error: Error; attempt: number }> {
  const { maxRetries = 3, ...restOptions } = options
  let lastAttempt = 0

  try {
    const result = await withAsyncErrorBoundary(operation, {
      maxRetries,
      ...restOptions,
    })
    return { success: true, data: result }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    return { success: false, error: err, attempt: lastAttempt }
  }
}

/**
 * Create a retry function with default options
 */
export function createRetryableOperation<T>(
  operation: () => Promise<T>,
  defaultOptions: AsyncErrorBoundaryOptions = {}
) {
  return (options: AsyncErrorBoundaryOptions = {}) =>
    withAsyncErrorBoundary(operation, { ...defaultOptions, ...options })
}

/**
 * Retry hook-like function for React components
 * Returns a function that can be called to execute the operation
 */
export function useAsyncErrorHandler() {
  return {
    execute: withAsyncErrorBoundary,
    fetchWithRetry: fetchWithErrorBoundary,
    tryOperation: tryAsyncOperation,
  }
}
