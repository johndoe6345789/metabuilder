import { describe, expect, it } from 'vitest'
import { isValidEmail } from './is-valid-email'

describe('isValidEmail', () => {
  const longEmail = `${'a'.repeat(250)}@example.com`

  it.each([
    { email: 'user@example.com' },
    { email: 'first.last+tag@sub.domain.com' },
  ])('accepts $email', ({ email }) => {
    expect(isValidEmail(email)).toBe(true)
  })

  it.each([
    { email: 'invalid-email' },
    { email: 'missing-at.example.com' },
    { email: longEmail },
  ])('rejects $email', ({ email }) => {
    expect(isValidEmail(email)).toBe(false)
  })
})
