import { describe, expect, it } from 'vitest'
import { isPlainObject } from '../../../src/core/validation/is-plain-object'

describe('isPlainObject', () => {
  it.each([
    { value: {}, expected: true, description: 'empty object' },
    { value: { key: 'value' }, expected: true, description: 'object with keys' },
    { value: [], expected: false, description: 'array' },
    { value: null, expected: false, description: 'null' },
    { value: 'string', expected: false, description: 'string' },
  ])('returns $expected for $description', ({ value, expected }) => {
    expect(isPlainObject(value)).toBe(expected)
  })
})
