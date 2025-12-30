import { describe, it, expect } from 'vitest'
import { isValidUsername } from '../../../src/core/validation/is-valid-username'

const fiftyChars = 'a'.repeat(50)
const fiftyOneChars = 'a'.repeat(51)

describe('isValidUsername', () => {
  it.each([
    { username: 'ab', expected: false, description: 'too short' },
    { username: 'user', expected: true, description: 'simple username' },
    { username: 'user_name-123', expected: true, description: 'allowed symbols' },
    { username: fiftyChars, expected: true, description: 'max length' },
    { username: '', expected: false, description: 'empty string' },
    { username: fiftyOneChars, expected: false, description: 'too long' },
    { username: 'user name', expected: false, description: 'contains space' },
    { username: 'user!', expected: false, description: 'contains punctuation' },
    { username: 'user.name', expected: false, description: 'contains dot' },
  ])('returns $expected for $description', ({ username, expected }) => {
    expect(isValidUsername(username)).toBe(expected)
  })
})
