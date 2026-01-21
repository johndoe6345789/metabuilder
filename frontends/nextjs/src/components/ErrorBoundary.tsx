'use client'

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays fallback UI.
 * Use this to prevent the entire app from crashing on component errors.
 * Includes improved error UI and error reporting integration.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { errorReporting } from '@/lib/error-reporting'

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI to show on error */
  fallback?: ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Context for error reporting */
  context?: Record<string, unknown>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorCount: number
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorCount = this.state.errorCount + 1

    // Report error
    errorReporting.reportError(error, {
      component: errorInfo.componentStack ?? undefined,
      ...this.props.context,
    })

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error)
      console.error('Component stack:', errorInfo.componentStack)
    }

    // Update state with error count
    this.setState({ errorCount })

    // Call optional error callback
    this.props.onError?.(error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  private handleReload = () => {
    // Full page reload
    window.location.reload()
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Return custom fallback if provided
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }

      const userMessage = this.state.error
        ? errorReporting.getUserMessage(this.state.error)
        : 'An error occurred while rendering this component.'

      // Default fallback UI with improved styling
      return (
        <div
          style={{
            padding: '24px',
            margin: '16px',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
            boxShadow: '0 2px 4px rgba(255, 107, 107, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                fontSize: '24px',
                flexShrink: 0,
                marginTop: '4px',
              }}
            >
              ⚠️
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#c92a2a', margin: '0 0 8px 0', fontSize: '18px' }}>
                Something went wrong
              </h2>
              <p style={{ color: '#495057', margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
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
                    Error details
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

              {/* Show error count if multiple errors */}
              {this.state.errorCount > 1 && (
                <p
                  style={{
                    color: '#ff6b6b',
                    fontSize: '12px',
                    margin: '8px 0',
                  }}
                >
                  This error has occurred {this.state.errorCount} times.
                </p>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <button
                  onClick={this.handleRetry}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#228be6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#1c7ed6'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#228be6'
                  }}
                >
                  Try again
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
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e9ecef'
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f1f3f5'
                  }}
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component to wrap any component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode,
  context?: Record<string, unknown>
): React.ComponentType<P> {
  const name = WrappedComponent.name !== '' ? WrappedComponent.name : undefined
  const displayName = WrappedComponent.displayName ?? name ?? 'Component'

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback} context={context}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`
  return ComponentWithErrorBoundary
}
