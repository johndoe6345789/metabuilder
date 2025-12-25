import { describe, expect, it } from 'vitest'
import { validateUserUpdate } from './validate-user-update'

describe('validateUserUpdate', () => {
  it.each([
    { data: { email: 'new@example.com' } },
    { data: { role: 'admin' as const } },
  ])('accepts %s', ({ data }) => {
    expect(validateUserUpdate(data)).toEqual([])
  })

  it.each([
    { data: { username: 'ab' }, message: 'Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)' },
    { data: { email: 'invalid-email' }, message: 'Invalid email format (max 255 chars)' },
    { data: { role: 'guest' as unknown as 'user' }, message: 'Invalid role' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateUserUpdate(data)).toContain(message)
  })
})
