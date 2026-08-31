import { describe, it, expect } from 'vitest'
import { calculateRetryDelay } from './retry-delay'

describe('calculateRetryDelay', () => {
  it('waits the initial delay on the first attempt', () => {
    expect(calculateRetryDelay(0, 1000, 8000)).toBe(1000)
  })

  it('doubles the delay each subsequent attempt', () => {
    expect(calculateRetryDelay(1, 1000, 8000)).toBe(2000)
    expect(calculateRetryDelay(2, 1000, 8000)).toBe(4000)
    expect(calculateRetryDelay(3, 1000, 8000)).toBe(8000)
  })

  it('caps the delay at maxDelayMs', () => {
    expect(calculateRetryDelay(4, 1000, 8000)).toBe(8000)
    expect(calculateRetryDelay(10, 1000, 8000)).toBe(8000)
  })

  it('honors a custom initial delay', () => {
    expect(calculateRetryDelay(0, 250, 8000)).toBe(250)
    expect(calculateRetryDelay(1, 250, 8000)).toBe(500)
  })

  it('never exceeds the cap even when initial alone exceeds it', () => {
    expect(calculateRetryDelay(0, 9000, 8000)).toBe(8000)
  })
})
