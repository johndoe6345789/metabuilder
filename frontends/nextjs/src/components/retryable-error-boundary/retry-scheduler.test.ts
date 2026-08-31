import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RetryScheduler } from './retry-scheduler'

describe('RetryScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports the full delay in whole seconds immediately', () => {
    const onTick = vi.fn()
    new RetryScheduler().start(2500, onTick, vi.fn())
    expect(onTick).toHaveBeenCalledWith(3)
  })

  it('counts down in whole seconds every 100ms', () => {
    const onTick = vi.fn()
    new RetryScheduler().start(2000, onTick, vi.fn())
    onTick.mockClear()

    vi.advanceTimersByTime(900)
    expect(onTick).toHaveBeenCalledWith(2)

    vi.advanceTimersByTime(900)
    expect(onTick).toHaveBeenCalledWith(1)
  })

  it('calls onComplete once the full delay elapses', () => {
    const onComplete = vi.fn()
    new RetryScheduler().start(1000, vi.fn(), onComplete)

    vi.advanceTimersByTime(999)
    expect(onComplete).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('stops ticking after onComplete fires', () => {
    const onTick = vi.fn()
    new RetryScheduler().start(500, onTick, vi.fn())
    onTick.mockClear()

    vi.advanceTimersByTime(500)
    const callsAtComplete = onTick.mock.calls.length
    vi.advanceTimersByTime(1000)
    expect(onTick.mock.calls.length).toBe(callsAtComplete)
  })
})
