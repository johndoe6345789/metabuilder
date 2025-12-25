import { describe, expect, it } from 'vitest'
import { isValidUsername } from './is-valid-username'

describe('isValidUsername', () => {
  it.each([
    { username: 'user_1' },
    { username: 'abc' },
    { username: 'user-name' },
  ])('accepts $username', ({ username }) => {
    expect(isValidUsername(username)).toBe(true)
  })

  it.each([
    { username: 'ab' },
    { username: 'user name' },
    { username: 'a'.repeat(51) },
  ])('rejects $username', ({ username }) => {
    expect(isValidUsername(username)).toBe(false)
  })
})
