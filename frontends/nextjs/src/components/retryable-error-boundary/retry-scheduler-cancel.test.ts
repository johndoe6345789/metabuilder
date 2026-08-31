import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RetryScheduler } from './retry-scheduler'

describe('RetryScheduler cancellation and restart', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('cancel stops a pending countdown and completion', () => {
    const onTick = vi.fn()
    const onComplete = vi.fn()
    const scheduler = new RetryScheduler()
    scheduler.start(1000, onTick, onComplete)
    onTick.mockClear()

    scheduler.cancel()
    vi.advanceTimersByTime(2000)

    expect(onTick).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('cancel is a no-op when nothing is scheduled', () => {
    expect(() => new RetryScheduler().cancel()).not.toThrow()
  })

  it('starting again cancels the previous countdown', () => {
    const firstComplete = vi.fn()
    const secondComplete = vi.fn()
    const scheduler = new RetryScheduler()

    scheduler.start(1000, vi.fn(), firstComplete)
    scheduler.start(1000, vi.fn(), secondComplete)

    vi.advanceTimersByTime(1000)
    expect(firstComplete).not.toHaveBeenCalled()
    expect(secondComplete).toHaveBeenCalledTimes(1)
  })
})
