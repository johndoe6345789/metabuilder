import { describe, expect, it } from 'vitest'
import { validateCredentialUpdate } from '../../../../../src/core/validation/validate-credential-update'

describe('validateCredentialUpdate', () => {
  it.each([
    { data: { passwordHash: 'new_hash' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateCredentialUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { username: 'ab' }, message: 'username must be 3-50 characters (alphanumeric, underscore, hyphen)' },
    { data: { passwordHash: '' }, message: 'passwordHash must be a non-empty string' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateCredentialUpdate(data)).toContain(message)
  })
})
