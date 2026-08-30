import { describe, expect, it } from 'vitest'

import { blockGeometry, inWindow, isLiveNow } from './timeline-blocks'

const entry = (start: string, end: string) => ({
  start_time: start,
  end_time: end,
})

const windowStart = new Date('2026-01-01T10:00:00Z')
const windowEnd = new Date('2026-01-01T12:30:00Z')
const windowMs = windowEnd.getTime() - windowStart.getTime()

describe('inWindow', () => {
  it('keeps an entry fully inside the window', () => {
    const e = entry('2026-01-01T10:30:00Z', '2026-01-01T11:00:00Z')
    expect(inWindow([e], windowStart, windowEnd)).toEqual([e])
  })

  it('keeps an entry that only overlaps the window', () => {
    const e = entry('2026-01-01T09:30:00Z', '2026-01-01T10:15:00Z')
    expect(inWindow([e], windowStart, windowEnd)).toEqual([e])
  })

  it('drops an entry entirely before the window', () => {
    const e = entry('2026-01-01T08:00:00Z', '2026-01-01T09:00:00Z')
    expect(inWindow([e], windowStart, windowEnd)).toEqual([])
  })

  it('drops an entry entirely after the window', () => {
    const e = entry('2026-01-01T13:00:00Z', '2026-01-01T14:00:00Z')
    expect(inWindow([e], windowStart, windowEnd)).toEqual([])
  })
})

describe('blockGeometry', () => {
  it('places a block spanning the first quarter of the window', () => {
    const e = entry('2026-01-01T10:00:00Z', '2026-01-01T10:37:30Z')
    const { left, width } = blockGeometry(e, windowStart, windowMs)
    expect(left).toBe(0)
    expect(width).toBeCloseTo(25, 5)
  })

  it('clamps the left edge for a block starting before the window', () => {
    const e = entry('2026-01-01T09:00:00Z', '2026-01-01T10:30:00Z')
    expect(blockGeometry(e, windowStart, windowMs).left).toBe(0)
  })

  it('clamps the right edge for a block ending after the window', () => {
    const e = entry('2026-01-01T12:00:00Z', '2026-01-01T13:00:00Z')
    const { left, width } = blockGeometry(e, windowStart, windowMs)
    expect(left + width).toBe(100)
  })

  it('gives even a zero-width overlap a minimum visible width', () => {
    const e = entry('2026-01-01T12:30:00Z', '2026-01-01T13:00:00Z')
    expect(blockGeometry(e, windowStart, windowMs).width).toBe(2)
  })
})

describe('isLiveNow', () => {
  it('is live while the clock sits inside the range', () => {
    const e = entry('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z')
    const clock = new Date('2026-01-01T10:30:00Z').getTime()
    expect(isLiveNow(e, clock)).toBe(true)
  })

  it('is not live before the range starts', () => {
    const e = entry('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z')
    const clock = new Date('2026-01-01T09:00:00Z').getTime()
    expect(isLiveNow(e, clock)).toBe(false)
  })

  it('is not live once the range has ended', () => {
    const e = entry('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z')
    const clock = new Date('2026-01-01T11:00:00Z').getTime()
    expect(isLiveNow(e, clock)).toBe(false)
  })
})
