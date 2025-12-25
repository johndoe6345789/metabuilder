import { describe, expect, it } from 'vitest'
import { validateUserCreate } from './validate-user-create'

describe('validateUserCreate', () => {
  const base = { username: 'valid_user', email: 'user@example.com', role: 'user' as const }

  it.each([
    { data: base },
  ])('accepts %s', ({ data }) => {
    expect(validateUserCreate(data)).toEqual([])
  })

  it.each([
    { data: { ...base, username: 'ab' }, message: 'Invalid username format (alphanumeric, underscore, hyphen only, 3-50 chars)' },
    { data: { ...base, email: 'invalid-email' }, message: 'Invalid email format (max 255 chars)' },
    { data: { ...base, role: 'guest' as unknown as 'user' }, message: 'Invalid role' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateUserCreate(data)).toContain(message)
  })
})
