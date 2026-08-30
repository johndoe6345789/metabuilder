import { describe, expect, it } from 'vitest'

import { formatTime } from './format-time'

describe('formatTime', () => {
  it('formats whole minutes and seconds', () => {
    expect(formatTime(65)).toBe('1:05')
  })

  it('pads single-digit seconds', () => {
    expect(formatTime(5)).toBe('0:05')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(59.9)).toBe('0:59')
  })

  it('shows a placeholder for a non-finite duration', () => {
    expect(formatTime(Infinity)).toBe('--:--')
  })

  it('shows a placeholder for NaN', () => {
    expect(formatTime(NaN)).toBe('--:--')
  })

  it('formats zero', () => {
    expect(formatTime(0)).toBe('0:00')
  })
})
