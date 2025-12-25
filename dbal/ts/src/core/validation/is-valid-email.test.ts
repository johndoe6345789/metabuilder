import { describe, it, expect } from 'vitest'
import { isValidEmail } from './is-valid-email'

describe('isValidEmail', () => {
  it.each([
    { name: 'basic', email: 'user@example.com', expected: true },
    { name: 'plus and subdomain', email: 'first.last+tag@sub.domain.co', expected: true },
    { name: 'missing domain', email: 'user@', expected: false },
    { name: 'missing local part', email: '@example.com', expected: false },
    { name: 'missing tld', email: 'user@example', expected: false },
    { name: 'double at', email: 'user@@example.com', expected: false },
    { name: 'space in email', email: 'user example@domain.com', expected: false },
    { name: 'short tld', email: 'user@domain.c', expected: false },
  ])('returns $expected for $name', ({ email, expected }) => {
    expect(isValidEmail(email)).toBe(expected)
  })
})
