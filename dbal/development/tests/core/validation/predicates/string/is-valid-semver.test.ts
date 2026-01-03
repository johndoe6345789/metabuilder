import { describe, expect, it } from 'vitest'
import { isValidSemver } from '../../../src/core/validation/is-valid-semver'

describe('isValidSemver', () => {
  it.each([
    { version: '1.0.0', expected: true },
    { version: '0.10.2', expected: true },
    { version: '1.0', expected: false },
    { version: '1.0.0-beta', expected: false },
    { version: 'v1.0.0', expected: false },
  ])('returns $expected for $version', ({ version, expected }) => {
    expect(isValidSemver(version)).toBe(expected)
  })
})
