import { describe, expect, it } from 'vitest'
import { validatePackageUpdate } from '../../../src/core/validation/validate-package-update'

describe('validatePackageUpdate', () => {
  it.each([
    { data: { version: '2.0.0' }, expected: [] },
    { data: { isInstalled: true }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validatePackageUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { name: '' }, message: 'name must be 1-255 characters' },
    { data: { version: '2.0' }, message: 'version must be semantic (x.y.z)' },
    { data: { manifest: [] }, message: 'manifest must be an object' },
    { data: { installedAt: 'not-a-date' }, message: 'installedAt must be a valid date' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validatePackageUpdate(data)).toContain(message)
  })
})
