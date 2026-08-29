import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'

import { RetryableErrorBoundary } from './RetryableErrorBoundary'

/** Throws while `gate.fail` is set, so a test controls recovery directly
 * rather than depending on how many times React chooses to render. */
const gate = { fail: true }

function Flaky({ error }: { error: Error }) {
  if (gate.fail) throw error
  return <div>recovered</div>
}

const netError = () => new Error('network request failed')
const permError = () => new Error('permission denied')

function renderBoundary(error: Error, props: Record<string, unknown> = {}) {
  return render(
    <RetryableErrorBoundary {...props}>
      <Flaky error={error} />
    </RetryableErrorBoundary>
  )
}

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

  describe('automatic retry', () => {
    it('recovers on its own once the child stops throwing', () => {
      renderBoundary(netError())
      expect(screen.queryByText('recovered')).toBeNull()

      gate.fail = false
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText('recovered')).toBeTruthy()
    })

    it('does not retry before the backoff elapses', () => {
      renderBoundary(netError())

      gate.fail = false
      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(screen.queryByText('recovered')).toBeNull()
    })

    it('honours a caller-supplied initial delay', () => {
      renderBoundary(netError(), { initialRetryDelayMs: 50 })

      gate.fail = false
      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(screen.getByText('recovered')).toBeTruthy()
    })

    it('does not auto-retry an error that is not retryable', () => {
      // A permission error will not fix itself; retrying it just spins.
      renderBoundary(permError(), { initialRetryDelayMs: 10 })

      gate.fail = false
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(screen.queryByText('recovered')).toBeNull()
    })

    it('gives up after maxAutoRetries', () => {
      renderBoundary(netError(), {
        maxAutoRetries: 1,
        initialRetryDelayMs: 10,
      })

      act(() => {
        vi.advanceTimersByTime(60000)
      })

      expect(screen.queryByText('recovered')).toBeNull()
    })
  })

  describe('unmounting mid-retry', () => {
    it('cancels its timers', () => {
      const { unmount } = renderBoundary(netError(), {
        initialRetryDelayMs: 100,
      })

      unmount()

      // A setState after unmount would warn through console.error.
      act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
