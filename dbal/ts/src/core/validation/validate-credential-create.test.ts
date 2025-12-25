import { describe, expect, it } from 'vitest'
import { validateCredentialCreate } from './validate-credential-create'

describe('validateCredentialCreate', () => {
  const base = {
    username: 'valid_user',
    passwordHash: 'hashed_value',
    firstLogin: true,
  }

  it.each([
    { data: base },
  ])('accepts %s', ({ data }) => {
    expect(validateCredentialCreate(data)).toEqual([])
  })

  it.each([
    { data: { ...base, username: 'ab' }, message: 'username must be 3-50 characters (alphanumeric, underscore, hyphen)' },
    { data: { ...base, passwordHash: ' ' }, message: 'passwordHash must be a non-empty string' },
    { data: { ...base, firstLogin: 'yes' as unknown as boolean }, message: 'firstLogin must be a boolean' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateCredentialCreate(data)).toContain(message)
  })
})
