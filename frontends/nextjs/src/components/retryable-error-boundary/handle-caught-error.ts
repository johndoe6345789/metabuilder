/** Reports a caught error exactly once (here, not in `render()`) and
 *  decides whether it qualifies for an automatic retry. */

import type { ErrorInfo } from 'react'
import { errorReporting } from '@/lib/error-reporting'
import type {
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState,
} from './types'

export interface CaughtErrorResult {
  errorCount: number
  category: RetryableErrorBoundaryState['category']
  shouldAutoRetry: boolean
}

export function handleCaughtError(
  error: Error,
  errorInfo: ErrorInfo,
  props: RetryableErrorBoundaryProps,
  state: RetryableErrorBoundaryState
): CaughtErrorResult {
  const errorCount = state.errorCount + 1
  const report = errorReporting.reportError(error, {
    component: props.componentName ?? errorInfo.componentStack ?? undefined,
    ...props.context,
  })

  if (process.env.NODE_ENV === 'development') {
    console.error('RetryableErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)
    console.error('Error category:', report.category)
    console.error('Is retryable:', report.isRetryable)
  }

  return {
    errorCount,
    category: report.category,
    shouldAutoRetry:
      report.isRetryable && state.retryCount < (props.maxAutoRetries ?? 3),
  }
}
