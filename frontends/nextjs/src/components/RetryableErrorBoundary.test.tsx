import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { RetryableErrorBoundary } from './RetryableErrorBoundary'
import { gate, netError, permError, renderBoundary } from './retryable-error-boundary-test-helpers'

describe('RetryableErrorBoundary', () => {
  beforeEach(() => {
    gate.fail = true
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('when nothing throws', () => {
    it('renders its children untouched', () => {
      render(
        <RetryableErrorBoundary>
          <div>fine</div>
        </RetryableErrorBoundary>
      )
      expect(screen.getByText('fine')).toBeTruthy()
    })
  })

  describe('when a child throws', () => {
    it('renders a fallback instead of crashing', () => {
      renderBoundary(permError())
      expect(screen.queryByText('recovered')).toBeNull()
    })

    it('prefers a caller-supplied fallback', () => {
      renderBoundary(permError(), { fallback: <p>custom</p> })
      expect(screen.getByText('custom')).toBeTruthy()
    })

    it('tells the caller through onError', () => {
      const onError = vi.fn()
      renderBoundary(permError(), { onError })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    it('shows a message describing the category', () => {
      renderBoundary(netError())
      // The network category's user message mentions the connection.
      expect(document.body.textContent).toMatch(/connection/i)
    })
  })
})
