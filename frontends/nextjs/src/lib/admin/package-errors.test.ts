import { describe, expect, it } from 'vitest'

import { PackageErrorCode } from '@/lib/types/package-admin-types'
import {
  getErrorMessage,
  isRetryableError,
  parseErrorCode,
} from '@/lib/admin/package-utils'

const coded = (code: PackageErrorCode, message = 'raw') =>
  ({ code, message }) as never

describe('parseErrorCode', () => {
  it('trusts a code the error already carries', () => {
    expect(parseErrorCode(coded(PackageErrorCode.SERVER_ERROR))).toBe(
      PackageErrorCode.SERVER_ERROR
    )
  })

  it.each([
    ['already installed', PackageErrorCode.ALREADY_INSTALLED],
    ['not installed', PackageErrorCode.ALREADY_UNINSTALLED],
    ['permission', PackageErrorCode.PERMISSION_DENIED],
    ['dependency', PackageErrorCode.DEPENDENCY_ERROR],
    ['not found', PackageErrorCode.PACKAGE_NOT_FOUND],
  ])('reads %s out of a plain Error message', (text, code) => {
    expect(parseErrorCode(new Error(`Package ${text} here`))).toBe(code)
  })

  it('falls back to unknown for anything unrecognised', () => {
    expect(parseErrorCode(new Error('kaboom'))).toBe(
      PackageErrorCode.UNKNOWN_ERROR
    )
    expect(parseErrorCode(null)).toBe(PackageErrorCode.UNKNOWN_ERROR)
    expect(parseErrorCode('a string')).toBe(PackageErrorCode.UNKNOWN_ERROR)
  })

  it('matches the first phrase present, in declaration order', () => {
    // "already installed" is checked before "not found".
    const error = new Error('already installed and not found')
    expect(parseErrorCode(error)).toBe(PackageErrorCode.ALREADY_INSTALLED)
  })
})

describe('getErrorMessage', () => {
  it('gives a readable line for a known code', () => {
    expect(getErrorMessage(coded(PackageErrorCode.NETWORK_ERROR))).toBe(
      'Network error. Please check your connection.'
    )
  })

  it('falls back to the raw message for an unmapped code', () => {
    expect(getErrorMessage(coded('WEIRD' as PackageErrorCode, 'odd'))).toBe(
      'odd'
    )
  })

  it('passes a plain Error through, and names the null case', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
    expect(getErrorMessage(null)).toBe('An unknown error occurred')
  })
})

describe('isRetryableError', () => {
  it('retries only the transient codes', () => {
    expect(isRetryableError(coded(PackageErrorCode.NETWORK_ERROR))).toBe(true)
    expect(isRetryableError(coded(PackageErrorCode.SERVER_ERROR))).toBe(true)
    expect(isRetryableError(coded(PackageErrorCode.PACKAGE_NOT_FOUND))).toBe(
      false
    )
  })

  it('does not retry a plain Error or nothing at all', () => {
    expect(isRetryableError(new Error('boom'))).toBe(false)
    expect(isRetryableError(null)).toBe(false)
  })
})
