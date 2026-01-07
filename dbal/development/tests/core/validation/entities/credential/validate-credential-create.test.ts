import { describe, expect, it } from 'vitest'
import { validateCredentialCreate } from '../../../src/core/validation/validate-credential-create'

describe('validateCredentialCreate', () => {
  const base = {
    username: 'valid_user',
    passwordHash: 'hashed_value',
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateCredentialCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, username: 'ab' }, message: 'username must be 3-50 characters (alphanumeric, underscore, hyphen)' },
    { data: { ...base, passwordHash: ' ' }, message: 'passwordHash must be a non-empty string' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateCredentialCreate(data)).toContain(message)
  })
})
