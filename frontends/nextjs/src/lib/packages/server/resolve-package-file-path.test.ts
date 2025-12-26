import { describe, expect, it } from 'vitest'
import { resolvePackageFilePath } from './resolve-package-file-path'

const root = '/repo/packages'

describe('resolvePackageFilePath', () => {
  it('returns null for empty path', () => {
    expect(resolvePackageFilePath([], root)).toBeNull()
  })

  it('returns resolved path for valid segments', () => {
    expect(resolvePackageFilePath(['social_hub', 'seed', 'metadata.json'], root)).toBe(
      '/repo/packages/social_hub/seed/metadata.json'
    )
  })

  it('blocks path traversal', () => {
    expect(resolvePackageFilePath(['..', 'secrets.txt'], root)).toBeNull()
  })
})
