import { describe, expect, it } from 'vitest'
import { validatePackageUpdate } from '../../../src/core/validation/validate-package-update'

describe('validatePackageUpdate', () => {
  it.each([
    { data: { version: '2.0.0' }, expected: [] },
    { data: { enabled: true }, expected: [] },
    { data: { config: '{"enabled":true}' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validatePackageUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { version: '2.0' }, message: 'version must be semantic (x.y.z)' },
    { data: { installedAt: 'not-a-date' }, message: 'installedAt must be a bigint timestamp' },
    { data: { enabled: 'yes' as unknown as boolean }, message: 'enabled must be a boolean' },
    { data: { config: 'not-json' }, message: 'config must be a JSON string' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validatePackageUpdate(data)).toContain(message)
  })
})
