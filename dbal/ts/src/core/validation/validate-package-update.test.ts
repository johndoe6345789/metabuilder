import { describe, expect, it } from 'vitest'
import { validatePackageUpdate } from './validate-package-update'

describe('validatePackageUpdate', () => {
  it.each([
    { data: { version: '2.0.0' } },
    { data: { isInstalled: true } },
  ])('accepts %s', ({ data }) => {
    expect(validatePackageUpdate(data)).toEqual([])
  })

  it.each([
    { data: { name: '' }, message: 'name must be 1-255 characters' },
    { data: { version: '2.0' }, message: 'version must be semantic (x.y.z)' },
    { data: { manifest: [] }, message: 'manifest must be an object' },
    { data: { installedAt: 'not-a-date' }, message: 'installedAt must be a valid date' },
  ])('rejects %s', ({ data, message }) => {
    expect(validatePackageUpdate(data)).toContain(message)
  })
})
