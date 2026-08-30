import { describe, expect, it } from 'vitest'

import { numericValue } from './numeric-value'

describe('numericValue', () => {
  it('strips the unit from a stored value', () => {
    expect(numericValue('12px', 0)).toBe(12)
  })

  it('falls back for an undefined value', () => {
    expect(numericValue(undefined, 8)).toBe(8)
  })

  it('falls back for a value that does not parse as a number', () => {
    expect(numericValue('auto', 8)).toBe(8)
  })

  it('parses a decimal', () => {
    expect(numericValue('1.5em', 0)).toBe(1.5)
  })

  it('parses a negative value', () => {
    expect(numericValue('-4px', 0)).toBe(-4)
  })

  it('parses a bare number with no unit', () => {
    expect(numericValue('600', 0)).toBe(600)
  })
})
