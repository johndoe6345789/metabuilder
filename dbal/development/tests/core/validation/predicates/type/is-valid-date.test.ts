import { describe, expect, it } from 'vitest'
import { isValidDate } from '../../../src/core/validation/is-valid-date'

describe('isValidDate', () => {
  const validDate = new Date('2024-01-01T00:00:00Z')
  const invalidDate = new Date('invalid')

  it.each([
    { value: validDate, expected: true, description: 'date instance' },
    { value: '2024-01-01T00:00:00Z', expected: true, description: 'iso string' },
    { value: 1704067200000, expected: true, description: 'timestamp' },
    { value: invalidDate, expected: false, description: 'invalid date instance' },
    { value: 'not-a-date', expected: false, description: 'invalid string' },
  ])('returns $expected for $description', ({ value, expected }) => {
    expect(isValidDate(value)).toBe(expected)
  })
})
