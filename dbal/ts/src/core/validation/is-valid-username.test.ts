import { describe, it, expect } from 'vitest'
import { isValidUsername } from './is-valid-username'

describe('isValidUsername', () => {
  it.each([
    { name: 'letters and digits', username: 'User123', expected: true },
    { name: 'underscore and hyphen', username: 'user_name-1', expected: true },
    { name: 'max length', username: 'a'.repeat(50), expected: true },
    { name: 'empty', username: '', expected: false },
    { name: 'too long', username: 'a'.repeat(51), expected: false },
    { name: 'space', username: 'user name', expected: false },
    { name: 'invalid char', username: 'user.name', expected: false },
  ])('returns $expected for $name', ({ username, expected }) => {
    expect(isValidUsername(username)).toBe(expected)
  })
})
