import { describe, it, expect } from 'vitest'
import { isValidTitle } from '../../../../../src/core/validation/is-valid-title'

const maxTitle = 'a'.repeat(255)
const tooLongTitle = 'a'.repeat(256)

describe('isValidTitle', () => {
  it.each([
    { title: 'Title', expected: true, description: 'simple title' },
    { title: maxTitle, expected: true, description: 'max length' },
    { title: '', expected: false, description: 'empty string' },
    { title: tooLongTitle, expected: false, description: 'too long' },
  ])('returns $expected for $description', ({ title, expected }) => {
    expect(isValidTitle(title)).toBe(expected)
  })
})
