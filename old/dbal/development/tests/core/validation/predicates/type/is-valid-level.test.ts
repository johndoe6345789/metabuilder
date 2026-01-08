import { describe, it, expect } from 'vitest'
import { isValidLevel } from '../../../src/core/validation/is-valid-level'

describe('isValidLevel', () => {
  it.each([
    { level: -1, expected: false, description: 'below range' },
    { level: 0, expected: false, description: 'below minimum' },
    { level: 1, expected: true, description: 'minimum' },
    { level: 3, expected: true, description: 'middle of range' },
    { level: 5, expected: true, description: 'upper range' },
    { level: 6, expected: true, description: 'maximum' },
    { level: 7, expected: false, description: 'above range' },
    { level: 2.5, expected: false, description: 'non-integer' },
  ])('returns $expected for $description', ({ level, expected }) => {
    expect(isValidLevel(level)).toBe(expected)
  })
})
