import { describe, expect, it } from 'vitest'

import {
  CREDENTIAL_RULE,
  MIN_PASSWORD,
  MIN_USERNAME,
  refuseCredential,
} from './credentials-validation'

describe('refuseCredential', () => {
  it('accepts a username and password that meet the minimums', () => {
    expect(refuseCredential('abc', '12345678')).toBeNull()
  })

  it('accepts values exactly at the minimums', () => {
    expect(
      refuseCredential('a'.repeat(MIN_USERNAME), 'p'.repeat(MIN_PASSWORD))
    ).toBeNull()
  })

  it.each(['', 'a', 'ab'])('refuses the username %p', username => {
    expect(refuseCredential(username, '12345678')).toBe(CREDENTIAL_RULE)
  })

  it.each(['', 'short', '1234567'])('refuses the password %p', password => {
    expect(refuseCredential('alice', password)).toBe(CREDENTIAL_RULE)
  })

  // Whitespace is trimmed before the write, so it must not count toward
  // the length either -- otherwise "   " is a three-character username.
  it('does not count surrounding whitespace', () => {
    expect(refuseCredential('   ', '        ')).toBe(CREDENTIAL_RULE)
    expect(refuseCredential('  ab  ', '12345678')).toBe(CREDENTIAL_RULE)
  })

  it('accepts a padded value that is long enough once trimmed', () => {
    expect(refuseCredential('  alice  ', '  12345678  ')).toBeNull()
  })
})
