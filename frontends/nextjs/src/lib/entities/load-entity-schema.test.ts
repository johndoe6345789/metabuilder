import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadJson = vi.hoisted(() => ({ loadJSONPackage: vi.fn() }))
const packagesDir = vi.hoisted(() => ({
  getPackagesDir: vi.fn(() => '/packages'),
}))

vi.mock('@/lib/packages/json/functions/load-json-package', () => loadJson)
vi.mock('@/lib/packages/unified/get-packages-dir', () => packagesDir)

import { loadEntitySchema } from './load-entity-schema'

const pkgWith = (metadata: Record<string, unknown>) => ({
  metadata,
  hasComponents: false,
  hasPermissions: false,
  hasStyles: false,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('loadEntitySchema', () => {
  it('returns the matching entity, defaulting fields to an empty array', async () => {
    loadJson.loadJSONPackage.mockResolvedValue(
      pkgWith({
        entities: [
          { name: 'Post', primaryKey: 'id', displayName: 'Post' },
          { name: 'User', fields: [{ name: 'email', type: 'string' }] },
        ],
      })
    )

    const schema = await loadEntitySchema('blog', 'Post')

    expect(schema).toEqual({
      name: 'Post',
      fields: [],
      primaryKey: 'id',
      displayName: 'Post',
      description: undefined,
    })
  })

  it('returns the fields when the entity declares them', async () => {
    loadJson.loadJSONPackage.mockResolvedValue(
      pkgWith({
        entities: [{ name: 'User', fields: [{ name: 'email', type: 'string' }] }],
      })
    )

    const schema = await loadEntitySchema('blog', 'User')

    expect(schema?.fields).toEqual([{ name: 'email', type: 'string' }])
  })

  it('returns null when the entity is not in the list', async () => {
    loadJson.loadJSONPackage.mockResolvedValue(
      pkgWith({ entities: [{ name: 'Post' }] })
    )

    expect(await loadEntitySchema('blog', 'Missing')).toBeNull()
  })

  it('returns null when the package metadata has no entities field', async () => {
    loadJson.loadJSONPackage.mockResolvedValue(pkgWith({}))

    expect(await loadEntitySchema('blog', 'Post')).toBeNull()
  })

  it('returns null when entities is not an array', async () => {
    loadJson.loadJSONPackage.mockResolvedValue(
      pkgWith({ entities: 'not-an-array' })
    )

    expect(await loadEntitySchema('blog', 'Post')).toBeNull()
  })

  it('returns null and logs when loading the package throws', async () => {
    loadJson.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(await loadEntitySchema('missing-pkg', 'Post')).toBeNull()
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })

  it('resolves the package path under the packages directory', async () => {
    loadJson.loadJSONPackage.mockResolvedValue(pkgWith({}))

    await loadEntitySchema('blog', 'Post')

    expect(loadJson.loadJSONPackage).toHaveBeenCalledWith('/packages/blog')
  })
})
