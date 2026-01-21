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
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId)
    }
  }

  static getDerivedStateFromError(error: Error): Partial<RetryableErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorCount = this.state.errorCount + 1
    const report = errorReporting.reportError(error, {
      component: this.props.componentName ?? errorInfo.componentStack ?? undefined,
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
    if (report.isRetryable && this.state.retryCount < (this.props.maxAutoRetries ?? 3)) {
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
  private scheduleAutoRetry = () => {
    if (!this.mounted) return

    const delay = this.calculateRetryDelay(this.state.retryCount)
    let remainingMs = delay

    // Start countdown display
    this.setState({ autoRetryScheduled: true, nextRetryIn: Math.ceil(remainingMs / 1000) })

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
  private handleAutoRetry = () => {
    if (!this.mounted) return

    // Clear countdown
    if (this.countdownIntervalId) {
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
  private handleManualRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
    if (this.countdownIntervalId) {
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
  private handleReload = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId)
    }
    window.location.reload()
  }

  /**
   * Get error category for styling
   */
  private getErrorCategory(): ErrorCategory {
    if (!this.state.error) return 'unknown'

    const report = errorReporting.reportError(this.state.error)
    return report.category
  }

  /**
   * Get visual indicator for error type
   */
  private getErrorIcon(category: ErrorCategory): string {
    const icons: Record<ErrorCategory, string> = {
      network: '🌐',
      authentication: '🔐',
      permission: '🚫',
      validation: '⚠️',
      'not-found': '🔍',
      conflict: '⚡',
      'rate-limit': '⏱️',
      server: '🖥️',
      timeout: '⏳',
      unknown: '⚠️',
    }
    return icons[category]
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }

      const category = this.getErrorCategory()
      const icon = this.getErrorIcon(category)

      const userMessage = this.state.error
        ? errorReporting.getUserMessage(this.state.error, category)
        : 'An error occurred while rendering this component.'

      const showSupportInfo = this.props.showSupportInfo ?? true
      const supportEmail = this.props.supportEmail ?? 'support@metabuilder.dev'

      // Color scheme based on error category
      const colorSchemes: Record<ErrorCategory, { border: string; bg: string; text: string }> = {
        network: {
          border: '#ffa94d',
          bg: '#fffbf0',
          text: '#d9480f',
        },
        authentication: {
          border: '#f06595',
          bg: '#fff0f6',
          text: '#c2255c',
        },
        permission: {
          border: '#ff6b6b',
          bg: '#fff5f5',
          text: '#c92a2a',
        },
        validation: {
          border: '#ffd43b',
          bg: '#fffef0',
          text: '#b5940b',
        },
        'not-found': {
          border: '#748ffc',
          bg: '#f0f4ff',
          text: '#3b47cc',
        },
        conflict: {
          border: '#ff8a65',
          bg: '#fff3e0',
          text: '#e64a19',
        },
        'rate-limit': {
          border: '#74c0fc',
          bg: '#e7f5ff',
          text: '#1971c2',
        },
        server: {
          border: '#ff6b6b',
          bg: '#fff5f5',
          text: '#c92a2a',
        },
        timeout: {
          border: '#ffa94d',
          bg: '#fffbf0',
          text: '#d9480f',
        },
        unknown: {
          border: '#ff6b6b',
          bg: '#fff5f5',
          text: '#c92a2a',
        },
      }

      const colors = colorSchemes[category]

      return (
        <div
          style={{
            padding: '24px',
            margin: '16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            backgroundColor: colors.bg,
            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.05)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                fontSize: '28px',
                flexShrink: 0,
                marginTop: '4px',
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: colors.text, margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                {category === 'not-found' ? 'Not Found' : 'Something went wrong'}
              </h2>
              <p
                style={{
                  color: '#495057',
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                {userMessage}
              </p>

              {/* Development-only error details */}
              {process.env.NODE_ENV === 'development' && this.state.error !== null && (
                <details style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: '#868e96',
                      fontSize: '12px',
                      fontWeight: 500,
                      userSelect: 'none',
                      padding: '4px 0',
                    }}
                  >
                    Error details ({category})
                  </summary>
                  <pre
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      maxHeight: '200px',
                      color: '#666',
                    }}
                  >
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}

              {/* Error count indicator */}
              {this.state.errorCount > 1 && (
                <p
                  style={{
                    color: colors.text,
                    fontSize: '12px',
                    margin: '8px 0',
                    fontWeight: 500,
                  }}
                >
                  Error occurred {this.state.errorCount} times
                </p>
              )}

              {/* Retry count and auto-retry status */}
              {this.state.retryCount > 0 && (
                <p
                  style={{
                    color: '#666',
                    fontSize: '12px',
                    margin: '4px 0',
                  }}
                >
                  Retry attempt: {this.state.retryCount} of {this.props.maxAutoRetries ?? 3}
                </p>
              )}

              {/* Auto-retry countdown */}
              {this.state.autoRetryScheduled && (
                <div
                  style={{
                    padding: '8px',
                    margin: '8px 0',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderLeft: '3px solid #4a90e2',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#1971c2',
                  }}
                >
                  Retrying in {this.state.nextRetryIn}s... (automatic)
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                <button
                  onClick={this.handleManualRetry}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.border,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.opacity = '1'
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f1f3f5',
                    color: '#495057',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e9ecef'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f1f3f5'
                  }}
                >
                  Reload Page
                </button>
              </div>

              {/* Support information */}
              {showSupportInfo && category !== 'not-found' && (
                <p
                  style={{
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#666',
                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    paddingTop: '12px',
                  }}
                >
                  If the problem persists, please{' '}
                  <a
                    href={`mailto:${supportEmail}`}
                    style={{
                      color: colors.text,
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    contact support
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
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
