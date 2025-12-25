import { describe, expect, it } from 'vitest'
import { validatePackageCreate } from './validate-package-create'

describe('validatePackageCreate', () => {
  const base = {
    name: 'forum',
    version: '1.0.0',
    author: 'MetaBuilder',
    manifest: { dependencies: [] },
    isInstalled: false,
  }

  it.each([
    { data: base },
    { data: { ...base, installedAt: '2024-01-01T00:00:00Z' } },
  ])('accepts %s', ({ data }) => {
    expect(validatePackageCreate(data)).toEqual([])
  })

  it.each([
    { data: { ...base, version: '1.0' }, message: 'version must be semantic (x.y.z)' },
    { data: { ...base, manifest: [] }, message: 'manifest must be an object' },
    { data: { ...base, isInstalled: 'no' as unknown as boolean }, message: 'isInstalled must be a boolean' },
    { data: { ...base, installedBy: 'invalid' }, message: 'installedBy must be a valid UUID' },
  ])('rejects %s', ({ data, message }) => {
    expect(validatePackageCreate(data)).toContain(message)
  })
})
