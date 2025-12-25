import { describe, expect, it } from 'vitest'
import { validateCredentialUpdate } from '../../../src/core/validation/validate-credential-update'

describe('validateCredentialUpdate', () => {
  it.each([
    { data: { passwordHash: 'new_hash' }, expected: [] },
    { data: { firstLogin: false }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateCredentialUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { username: 'ab' }, message: 'username must be 3-50 characters (alphanumeric, underscore, hyphen)' },
    { data: { passwordHash: '' }, message: 'passwordHash must be a non-empty string' },
    { data: { firstLogin: 'no' as unknown as boolean }, message: 'firstLogin must be a boolean' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateCredentialUpdate(data)).toContain(message)
  })
})
