import { describe, expect, it } from 'vitest'
import { isValidDate } from './is-valid-date'

describe('isValidDate', () => {
  const validDate = new Date('2024-01-01T00:00:00Z')
  const invalidDate = new Date('invalid')

  it.each([
    { value: validDate, expected: true },
    { value: '2024-01-01T00:00:00Z', expected: true },
    { value: 1704067200000, expected: true },
    { value: invalidDate, expected: false },
    { value: 'not-a-date', expected: false },
    { value: {}, expected: false },
  ])('returns $expected for %s', ({ value, expected }) => {
    expect(isValidDate(value)).toBe(expected)
  })
})
