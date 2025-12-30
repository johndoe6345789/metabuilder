import { describe, expect, it } from 'vitest'
import { isValidUuid } from '../../../src/core/validation/is-valid-uuid'

describe('isValidUuid', () => {
  it.each([
    { id: '550e8400-e29b-41d4-a716-446655440000', expected: true },
    { id: '00000000-0000-0000-0000-000000000000', expected: true },
    { id: 'not-a-uuid', expected: false },
    { id: '550e8400e29b41d4a716446655440000', expected: false },
  ])('returns $expected for $id', ({ id, expected }) => {
    expect(isValidUuid(id)).toBe(expected)
  })
})
