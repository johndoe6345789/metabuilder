import { describe, it, expect } from 'vitest'
import type { ErrorInfo } from 'react'
import { handleCaughtError } from './handle-caught-error'
import { initialRetryableErrorBoundaryState } from './initial-state'
import type { RetryableErrorBoundaryProps } from './types'

const errorInfo: ErrorInfo = { componentStack: 'at Widget' }

function props(
  overrides: Partial<RetryableErrorBoundaryProps> = {}
): RetryableErrorBoundaryProps {
  return { children: null, ...overrides }
}

describe('handleCaughtError', () => {
  it('increments the error count from the current state', () => {
    const state = { ...initialRetryableErrorBoundaryState, errorCount: 2 }
    const result = handleCaughtError(
      new Error('network request failed'),
      errorInfo,
      props(),
      state
    )
    expect(result.errorCount).toBe(3)
  })

  it('categorizes a retryable error and allows auto-retry', () => {
    const result = handleCaughtError(
      new Error('network request failed'),
      errorInfo,
      props(),
      initialRetryableErrorBoundaryState
    )
    expect(result.category).toBe('network')
    expect(result.shouldAutoRetry).toBe(true)
  })

  it('does not allow auto-retry for a non-retryable category', () => {
    const result = handleCaughtError(
      new Error('validation failed: invalid email'),
      errorInfo,
      props(),
      initialRetryableErrorBoundaryState
    )
    expect(result.category).toBe('validation')
    expect(result.shouldAutoRetry).toBe(false)
  })

  it('stops auto-retrying once maxAutoRetries is reached', () => {
    const state = { ...initialRetryableErrorBoundaryState, retryCount: 3 }
    const result = handleCaughtError(
      new Error('network request failed'),
      errorInfo,
      props({ maxAutoRetries: 3 }),
      state
    )
    expect(result.shouldAutoRetry).toBe(false)
  })
})
