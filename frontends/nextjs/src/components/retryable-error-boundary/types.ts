/** Props and state shared between the boundary class and its retry
 *  controller, split out so neither side has to import the other. */

import type { ReactNode, ErrorInfo } from 'react'
import type { ErrorCategory } from '@/lib/error-reporting'

export interface RetryableErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI to show on error */
  fallback?: ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Context for error reporting */
  context?: Record<string, unknown>
  /** Maximum number of automatic retries */
  maxAutoRetries?: number
  /** Initial delay for exponential backoff (ms) */
  initialRetryDelayMs?: number
  /** Maximum delay between retries (ms) */
  maxRetryDelayMs?: number
  /** Component name for debugging */
  componentName?: string
  /** Whether to show support contact info */
  showSupportInfo?: boolean
  /** Support email or contact URL */
  supportEmail?: string
}

export interface RetryableErrorBoundaryState {
  hasError: boolean
  error: Error | null
  category: ErrorCategory
  errorCount: number
  retryCount: number
  isRetrying: boolean
  nextRetryIn: number
  autoRetryScheduled: boolean
}
