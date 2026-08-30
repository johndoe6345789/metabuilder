import { describe, expect, it } from 'vitest'

import { computeWindow, floorToSlot } from './timeline-window'

describe('floorToSlot', () => {
  it('rounds down to the nearest slot boundary', () => {
    const d = new Date('2026-01-01T10:47:00Z')
    expect(floorToSlot(d, 30).toISOString()).toBe('2026-01-01T10:30:00.000Z')
  })

  it('leaves an exact boundary unchanged', () => {
    const d = new Date('2026-01-01T10:30:00Z')
    expect(floorToSlot(d, 30).toISOString()).toBe(d.toISOString())
  })
})

describe('computeWindow', () => {
  it('builds one slot per SLOT_MINUTES across the window', () => {
    const clock = new Date('2026-01-01T10:00:00Z').getTime()
    const { slots } = computeWindow(clock, 150, 30)
    expect(slots).toHaveLength(5)
  })

  it('starts the window at the floored slot', () => {
    const clock = new Date('2026-01-01T10:47:00Z').getTime()
    const { windowStart } = computeWindow(clock, 150, 30)
    expect(windowStart.toISOString()).toBe('2026-01-01T10:30:00.000Z')
  })

  it('ends the window windowMinutes after the start', () => {
    const clock = new Date('2026-01-01T10:00:00Z').getTime()
    const { windowStart, windowEnd } = computeWindow(clock, 150, 30)
    expect(windowEnd.getTime() - windowStart.getTime()).toBe(150 * 60 * 1000)
  })

  it('places "now" at 0% right at the window start', () => {
    const clock = new Date('2026-01-01T10:30:00Z').getTime()
    expect(computeWindow(clock, 150, 30).nowPct).toBe(0)
  })

  it('places "now" partway through its own slot as a fraction of the whole window', () => {
    // The window always starts at clock's own floored slot, so "now" can
    // only ever drift up to one slot's width into the window (here 15 of
    // 30 minutes into a 150-minute window: 10%), never further.
    const clock = new Date('2026-01-01T10:45:00Z').getTime()
    expect(computeWindow(clock, 150, 30).nowPct).toBeCloseTo(10, 5)
  })
})
