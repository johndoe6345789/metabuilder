import { describe, it, expect } from 'vitest'
import { buildFallbackView } from './build-fallback-view'
import { initialRetryableErrorBoundaryState } from './initial-state'
import type { RetryableErrorBoundaryProps } from './types'

function props(
  overrides: Partial<RetryableErrorBoundaryProps> = {}
): RetryableErrorBoundaryProps {
  return { children: null, ...overrides }
}

describe('buildFallbackView', () => {
  it('falls back to a generic message when there is no error object', () => {
    const view = buildFallbackView(props(), initialRetryableErrorBoundaryState)
    expect(view.userMessage).toBe(
      'An error occurred while rendering this component.'
    )
  })

  it('derives icon and colors from the error category', () => {
    const state = {
      ...initialRetryableErrorBoundaryState,
      error: new Error('boom'),
      category: 'network' as const,
    }
    const view = buildFallbackView(props(), state)
    expect(view.category).toBe('network')
    expect(view.icon).toBeTruthy()
    expect(view.colors).toBeTruthy()
  })

  it('applies default support info when props omit it', () => {
    const view = buildFallbackView(props(), initialRetryableErrorBoundaryState)
    expect(view.showSupportInfo).toBe(true)
    expect(view.supportEmail).toBe('support@metabuilder.dev')
  })

  it('honors explicit support info props', () => {
    const view = buildFallbackView(
      props({ showSupportInfo: false, supportEmail: 'help@example.com' }),
      initialRetryableErrorBoundaryState
    )
    expect(view.showSupportInfo).toBe(false)
    expect(view.supportEmail).toBe('help@example.com')
  })

  it('carries retry/error counters through unchanged', () => {
    const state = {
      ...initialRetryableErrorBoundaryState,
      errorCount: 4,
      retryCount: 2,
      nextRetryIn: 3,
      autoRetryScheduled: true,
    }
    const view = buildFallbackView(props({ maxAutoRetries: 5 }), state)
    expect(view.errorCount).toBe(4)
    expect(view.retryCount).toBe(2)
    expect(view.nextRetryIn).toBe(3)
    expect(view.autoRetryScheduled).toBe(true)
    expect(view.maxAutoRetries).toBe(5)
  })
})
