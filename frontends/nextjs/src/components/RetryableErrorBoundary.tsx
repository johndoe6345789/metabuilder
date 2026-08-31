'use client'

/**
 * Retryable Error Boundary Component
 *
 * Catches React errors, shows a category-aware fallback, and
 * automatically retries transient failures (network, timeout, 5xx)
 * with exponential backoff, up to a configurable retry limit.
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { categorizeError } from '@/lib/error-reporting'
import { ErrorBoundaryFallback } from './error-boundary/ErrorBoundaryFallback'
import { createRetryController } from './retryable-error-boundary/create-retry-controller'
import { handleCaughtError } from './retryable-error-boundary/handle-caught-error'
import { buildFallbackView } from './retryable-error-boundary/build-fallback-view'
import { initialRetryableErrorBoundaryState } from './retryable-error-boundary/initial-state'
import type {
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState,
} from './retryable-error-boundary/types'

export type { RetryableErrorBoundaryProps }

export class RetryableErrorBoundary extends Component<
  RetryableErrorBoundaryProps,
  RetryableErrorBoundaryState
> {
  override state = initialRetryableErrorBoundaryState
  private mounted = true
  private readonly retry = createRetryController({
    isMounted: () => this.mounted,
    getState: () => this.state,
    getInitialRetryDelayMs: () => this.props.initialRetryDelayMs ?? 1000,
    getMaxRetryDelayMs: () => this.props.maxRetryDelayMs ?? 8000,
    setState: patch => {
      this.setState(patch)
    },
  })

  override componentDidMount() {
    this.mounted = true
  }

  override componentWillUnmount() {
    this.mounted = false
    this.retry.cancel()
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<RetryableErrorBoundaryState> {
    return { hasError: true, error, category: categorizeError(error) }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const result = handleCaughtError(error, errorInfo, this.props, this.state)
    this.setState({ errorCount: result.errorCount, category: result.category })
    this.props.onError?.(error, errorInfo)
    if (result.shouldAutoRetry) this.retry.scheduleAutoRetry()
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback

      return (
        <ErrorBoundaryFallback
          view={buildFallbackView(this.props, this.state)}
          onRetry={this.retry.handleManualRetry}
          onReload={this.retry.handleReload}
        />
      )
    }

    return this.props.children
  }
}
