import { describe, it, expect } from 'vitest'
import { isValidTitle } from './is-valid-title'

describe('isValidTitle', () => {
  it.each([
    { name: 'min length', title: 'A', expected: true },
    { name: 'max length', title: 'a'.repeat(200), expected: true },
    { name: 'empty', title: '', expected: false },
    { name: 'over max length', title: 'a'.repeat(201), expected: false },
  ])('returns $expected for $name', ({ title, expected }) => {
    expect(isValidTitle(title)).toBe(expected)
  })
})
