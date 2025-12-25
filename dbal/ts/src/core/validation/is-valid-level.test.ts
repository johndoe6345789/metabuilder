import { describe, it, expect } from 'vitest'
import { isValidLevel } from './is-valid-level'

describe('isValidLevel', () => {
  it.each([
    { name: 'min', level: 0, expected: true },
    { name: 'max', level: 5, expected: true },
    { name: 'mid', level: 3, expected: true },
    { name: 'below min', level: -1, expected: false },
    { name: 'above max', level: 6, expected: false },
  ])('returns $expected for $name', ({ level, expected }) => {
    expect(isValidLevel(level)).toBe(expected)
  })
})
