import { describe, it, expect } from 'vitest'
import { isValidEmail } from '../../../src/core/validation/is-valid-email'

describe('isValidEmail', () => {
  it.each([
    { email: 'user@example.com', expected: true, description: 'basic email' },
    { email: 'user.name+tag@example.co.uk', expected: true, description: 'subdomain with plus tag' },
    { email: 'user_name-123@example-domain.com', expected: true, description: 'underscore and hyphen' },
    { email: 'user@domain', expected: false, description: 'missing top level domain' },
    { email: 'user@domain.c', expected: false, description: 'tld too short' },
    { email: 'user@domain.123', expected: false, description: 'numeric tld' },
    { email: 'user@@example.com', expected: false, description: 'double at' },
    { email: 'userexample.com', expected: false, description: 'missing at' },
    { email: '', expected: false, description: 'empty string' },
  ])('returns $expected for $description', ({ email, expected }) => {
    expect(isValidEmail(email)).toBe(expected)
  })
})
