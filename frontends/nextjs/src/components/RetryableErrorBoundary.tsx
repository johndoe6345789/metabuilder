'use client'

/**
 * Retryable Error Boundary Component
 *
 * Enhanced error boundary with automatic retry logic for transient failures.
 * Catches React errors and async errors, displays user-friendly UI,
 * and automatically retries for retryable error types.
 *
 * Features:
 * - Automatic retry for transient failures (network, timeout, 5xx)
 * - Exponential backoff between retries
 * - User-facing error categorization and helpful messages
 * - Developer-friendly error details in development mode
 * - Error recovery suggestions based on error type
 * - Retry count indicator and abort mechanism
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { errorReporting, type ErrorCategory } from '@/lib/error-reporting'
import { colorsFor, iconFor } from './error-boundary-presentation'
import { ErrorBoundaryFallback } from './ErrorBoundaryFallback'

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

interface RetryableErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorCount: number
  retryCount: number
  isRetrying: boolean
  nextRetryIn: number
  autoRetryScheduled: boolean
}

export class RetryableErrorBoundary extends Component<
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private countdownIntervalId: NodeJS.Timeout | null = null
  private mounted = true

  constructor(props: RetryableErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
      retryCount: 0,
      isRetrying: false,
      nextRetryIn: 0,
      autoRetryScheduled: false,
    }
  }

  override componentDidMount() {
    this.mounted = true
  }

  override componentWillUnmount() {
    this.mounted = false
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId)
    }
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId)
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<RetryableErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorCount = this.state.errorCount + 1
    const report = errorReporting.reportError(error, {
      component:
        this.props.componentName ?? errorInfo.componentStack ?? undefined,
      ...this.props.context,
    })

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('RetryableErrorBoundary caught an error:', error)
      console.error('Component stack:', errorInfo.componentStack)
      console.error('Error category:', report.category)
      console.error('Is retryable:', report.isRetryable)
    }

    this.setState({ errorCount })

    // Call optional error callback
    this.props.onError?.(error, errorInfo)

    // Schedule automatic retry for retryable errors
    if (
      report.isRetryable &&
      this.state.retryCount < (this.props.maxAutoRetries ?? 3)
    ) {
      this.scheduleAutoRetry()
    }
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const initialDelay = this.props.initialRetryDelayMs ?? 1000
    const maxDelay = this.props.maxRetryDelayMs ?? 8000
    const delay = initialDelay * Math.pow(2, attempt)
    return Math.min(delay, maxDelay)
  }

  /**
   * Schedule automatic retry with countdown
   */
  private readonly scheduleAutoRetry = () => {
    if (!this.mounted) return

    const delay = this.calculateRetryDelay(this.state.retryCount)
    let remainingMs = delay

    // Start countdown display
    this.setState({
      autoRetryScheduled: true,
      nextRetryIn: Math.ceil(remainingMs / 1000),
    })

    // Update countdown every 100ms
    this.countdownIntervalId = setInterval(() => {
      remainingMs -= 100
      if (this.mounted && remainingMs > 0) {
        this.setState({ nextRetryIn: Math.ceil(remainingMs / 1000) })
      }
    }, 100)

    // Schedule the retry
    this.retryTimeoutId = setTimeout(() => {
      if (this.mounted && this.state.hasError) {
        this.handleAutoRetry()
      }
    }, delay)
  }

  /**
   * Handle automatic retry
   */
  private readonly handleAutoRetry = () => {
    if (!this.mounted) return

    // Clear countdown
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId)
      this.countdownIntervalId = null
    }

    // Attempt retry
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
      autoRetryScheduled: false,
      nextRetryIn: 0,
    }))
  }

  /**
   * Handle manual retry from user
   */
  private readonly handleManualRetry = () => {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId)
      this.countdownIntervalId = null
    }

    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
      autoRetryScheduled: false,
      nextRetryIn: 0,
    })
  }

  /**
   * Handle page reload
   */
  private readonly handleReload = () => {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId)
    }
    if (this.countdownIntervalId !== null) {
      clearInterval(this.countdownIntervalId)
    }
    window.location.reload()
  }

  /**
   * Get error category for styling
   */
  private getErrorCategory(): ErrorCategory {
    if (this.state.error === null) return 'unknown'

    const report = errorReporting.reportError(this.state.error)
    return report.category
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }

      const category = this.getErrorCategory()

      return (
        <ErrorBoundaryFallback
          view={{
            error: this.state.error,
            category,
            icon: iconFor(category),
            colors: colorsFor(category),
            userMessage:
              this.state.error !== null
                ? errorReporting.getUserMessage(this.state.error, category)
                : 'An error occurred while rendering this component.',
            errorCount: this.state.errorCount,
            retryCount: this.state.retryCount,
            nextRetryIn: this.state.nextRetryIn,
            autoRetryScheduled: this.state.autoRetryScheduled,
            maxAutoRetries: this.props.maxAutoRetries,
            showSupportInfo: this.props.showSupportInfo ?? true,
            supportEmail:
              this.props.supportEmail ?? 'support@metabuilder.dev',
          }}
          onRetry={this.handleManualRetry}
          onReload={this.handleReload}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap any component with retryable error boundary
 */
export function withRetryableErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode
    context?: Record<string, unknown>
    maxAutoRetries?: number
    componentName?: string
  }
): React.ComponentType<P> {
  const name = WrappedComponent.name !== '' ? WrappedComponent.name : undefined
  const displayName = WrappedComponent.displayName ?? name ?? 'Component'

  const ComponentWithRetryableErrorBoundary = (props: P) => (
    <RetryableErrorBoundary
      fallback={options?.fallback}
      context={options?.context}
      maxAutoRetries={options?.maxAutoRetries}
      componentName={options?.componentName ?? displayName}
    >
      <WrappedComponent {...props} />
    </RetryableErrorBoundary>
  )

  ComponentWithRetryableErrorBoundary.displayName = `withRetryableErrorBoundary(${displayName})`
  return ComponentWithRetryableErrorBoundary
}
