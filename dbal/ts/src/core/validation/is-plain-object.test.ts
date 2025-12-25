import { describe, expect, it } from 'vitest'
import { isPlainObject } from './is-plain-object'

describe('isPlainObject', () => {
  it.each([
    { value: {}, expected: true },
    { value: { key: 'value' }, expected: true },
    { value: [], expected: false },
    { value: null, expected: false },
    { value: 'string', expected: false },
    { value: 123, expected: false },
  ])('returns $expected for %s', ({ value, expected }) => {
    expect(isPlainObject(value)).toBe(expected)
  })
})
