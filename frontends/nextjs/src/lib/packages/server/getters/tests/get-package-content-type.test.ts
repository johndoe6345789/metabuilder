import { describe, expect, it } from 'vitest'
import { getPackageContentType } from './get-package-content-type'

describe('getPackageContentType', () => {
  it.each([
    { path: '/repo/packages/foo/metadata.json', expected: 'application/json' },
    { path: '/repo/packages/foo/scripts/init.lua', expected: 'text/plain' },
    { path: '/repo/packages/foo/assets/logo.svg', expected: 'image/svg+xml' },
    { path: '/repo/packages/foo/assets/logo.png', expected: 'image/png' },
    { path: '/repo/packages/foo/readme.md', expected: 'text/markdown' },
  ])('maps $path to $expected', ({ path, expected }) => {
    expect(getPackageContentType(path)).toBe(expected)
  })
})
