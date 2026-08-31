import type { RetryableErrorBoundaryState } from './types'

export const initialRetryableErrorBoundaryState: RetryableErrorBoundaryState =
  {
    hasError: false,
    error: null,
    category: 'unknown',
    errorCount: 0,
    retryCount: 0,
    isRetrying: false,
    nextRetryIn: 0,
    autoRetryScheduled: false,
  }
