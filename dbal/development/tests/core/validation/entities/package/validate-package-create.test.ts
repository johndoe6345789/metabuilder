import { describe, expect, it } from 'vitest'
import { validatePackageCreate } from '../../../../../src/core/validation/validate-package-create'

describe('validatePackageCreate', () => {
  const base = {
    packageId: 'pkg-forum',
    installedAt: BigInt(1704067200000),
    version: '1.0.0',
    enabled: true,
    config: '{"dependencies":[]}',
  }

  it.each([
    { data: base, expected: [] },
    { data: { ...base, config: null }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validatePackageCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, version: '1.0' }, message: 'version must be semantic (x.y.z)' },
    { data: { ...base, installedAt: '2024-01-01T00:00:00Z' }, message: 'installedAt must be a bigint timestamp' },
    { data: { ...base, enabled: 'no' as unknown as boolean }, message: 'enabled must be a boolean' },
    { data: { ...base, config: 'not-json' }, message: 'config must be a JSON string' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validatePackageCreate(data)).toContain(message)
  })
})
