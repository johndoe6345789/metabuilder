import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { progressPercent } from './progress-percent'

describe('progressPercent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T10:30:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is 50% halfway through the slot', () => {
    const pct = progressPercent(
      '2026-01-01T10:00:00Z',
      '2026-01-01T11:00:00Z'
    )
    expect(pct).toBe(50)
  })

  it('is 0% right at the start', () => {
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
    const pct = progressPercent(
      '2026-01-01T10:00:00Z',
      '2026-01-01T11:00:00Z'
    )
    expect(pct).toBe(0)
  })

  it('clamps to 100% once the slot has ended', () => {
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
    const pct = progressPercent(
      '2026-01-01T10:00:00Z',
      '2026-01-01T11:00:00Z'
    )
    expect(pct).toBe(100)
  })

  it('clamps to 0% before the slot has started', () => {
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    const pct = progressPercent(
      '2026-01-01T10:00:00Z',
      '2026-01-01T11:00:00Z'
    )
    expect(pct).toBe(0)
  })

  it('is 0 for a zero-or-negative-length slot', () => {
    const pct = progressPercent(
      '2026-01-01T11:00:00Z',
      '2026-01-01T10:00:00Z'
    )
    expect(pct).toBe(0)
  })
})
