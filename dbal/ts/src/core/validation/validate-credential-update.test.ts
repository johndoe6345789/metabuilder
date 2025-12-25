import { describe, expect, it } from 'vitest'
import { validateCredentialUpdate } from './validate-credential-update'

describe('validateCredentialUpdate', () => {
  it.each([
    { data: { passwordHash: 'new_hash' } },
    { data: { firstLogin: false } },
  ])('accepts %s', ({ data }) => {
    expect(validateCredentialUpdate(data)).toEqual([])
  })

  it.each([
    { data: { username: 'ab' }, message: 'username must be 3-50 characters (alphanumeric, underscore, hyphen)' },
    { data: { passwordHash: '' }, message: 'passwordHash must be a non-empty string' },
    { data: { firstLogin: 'no' as unknown as boolean }, message: 'firstLogin must be a boolean' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateCredentialUpdate(data)).toContain(message)
  })
})
