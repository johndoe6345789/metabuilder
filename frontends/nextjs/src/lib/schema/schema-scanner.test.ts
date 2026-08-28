import { beforeEach, describe, expect, it, vi } from 'vitest'

const fs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
}))
vi.mock('fs', () => ({ ...fs, default: fs }))

import { scanAllPackages } from './schema-scanner'
import { SchemaRegistry } from './schema-registry'

const dir = (name: string) => ({ name, isDirectory: () => true })
const file = (name: string) => ({ name, isDirectory: () => false })

/** Lays out a fake packages/ tree: name -> package.json contents. */
function layout(packages: Record<string, unknown>, hasJson = true) {
  fs.existsSync.mockImplementation((p: string) => {
    if (p.endsWith('package.json')) return hasJson
    return true
  })
  fs.readdirSync.mockReturnValue(Object.keys(packages).map(dir))
  fs.readFileSync.mockImplementation((p: string) => {
    const id = String(p).split('/').at(-2) ?? ''
    const body = packages[id]
    return typeof body === 'string' ? body : JSON.stringify(body)
  })
}

const withSchema = (
  entities: unknown,
  extra: Record<string, unknown> = {}
) => ({
  packageId: 'forum',
  name: 'Forum',
  version: '1.0.0',
  schema: { entities, path: 'schema/' },
  ...extra,
})

describe('scanAllPackages', () => {
  let registry: SchemaRegistry

  beforeEach(() => {
    vi.clearAllMocks()
    registry = new SchemaRegistry()
  })

  describe('when the packages directory is missing', () => {
    it('reports it rather than throwing', () => {
      fs.existsSync.mockReturnValue(false)

      const result = scanAllPackages(registry, '/nope')

      expect(result.scanned).toBe(0)
      expect(result.errors[0]).toContain('/nope')
    })
  })

  describe('scanning', () => {
    it('registers a schema per entity', () => {
      layout({ forum: withSchema(['Post', 'Thread']) })

      const result = scanAllPackages(registry, '/packages')

      expect(result.scanned).toBe(1)
      expect(result.queued).toBe(2)
      expect(registry.has('forum:Post')).toBe(true)
      expect(registry.has('forum:Thread')).toBe(true)
    })

    it('records the package metadata', () => {
      layout({ forum: withSchema(['Post']) })

      scanAllPackages(registry, '/packages')

      expect(registry.packages.forum).toMatchObject({
        packageId: 'forum',
        name: 'Forum',
        version: '1.0.0',
      })
    })

    it('falls back to the directory name when packageId is absent', () => {
      layout({ forum: { schema: { entities: ['Post'] } } })

      scanAllPackages(registry, '/packages')

      expect(registry.packages.forum).toBeTruthy()
    })

    it('falls back to the id when name is absent', () => {
      layout({ forum: { schema: { entities: ['Post'] } } })

      scanAllPackages(registry, '/packages')

      expect((registry.packages.forum as { name: string }).name).toBe('forum')
    })

    it('does not count an entity it already knows as queued', () => {
      layout({ forum: withSchema(['Post']) })

      scanAllPackages(registry, '/packages')
      const second = scanAllPackages(registry, '/packages')

      expect(second.scanned).toBe(1)
      expect(second.queued).toBe(0)
    })

    it('skips files that are not directories', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readdirSync.mockReturnValue([file('README.md')])

      expect(scanAllPackages(registry, '/packages').scanned).toBe(0)
    })

    it('skips a directory with no package.json', () => {
      layout({ forum: withSchema(['Post']) }, false)

      expect(scanAllPackages(registry, '/packages').scanned).toBe(0)
    })
  })

  describe('malformed packages', () => {
    it('reports unparseable JSON and keeps going', () => {
      layout({ bad: 'not json{', forum: withSchema(['Post']) })

      const result = scanAllPackages(registry, '/packages')

      expect(result.errors.some(e => e.includes('Failed to parse'))).toBe(true)
      // The good package was still scanned.
      expect(result.scanned).toBe(1)
    })

    it('skips a package with no schema block without erroring', () => {
      layout({ plain: { packageId: 'plain', name: 'Plain' } })

      const result = scanAllPackages(registry, '/packages')

      expect(result.scanned).toBe(0)
      expect(result.errors).toEqual([])
    })

    it('skips a null schema block', () => {
      layout({ plain: { packageId: 'plain', schema: null } })

      expect(scanAllPackages(registry, '/packages').errors).toEqual([])
    })

    it('reports a schema whose entities are not an array', () => {
      layout({ forum: withSchema('Post') })

      const result = scanAllPackages(registry, '/packages')

      expect(result.errors[0]).toContain('entities missing or invalid')
      expect(result.scanned).toBe(0)
    })

    it('reports non-string entity names but registers the valid ones', () => {
      layout({ forum: withSchema(['Post', 42, null]) })

      const result = scanAllPackages(registry, '/packages')

      expect(result.errors.some(e => e.includes('Invalid entity names'))).toBe(
        true
      )
      expect(registry.has('forum:Post')).toBe(true)
    })

    it('drops an empty entity name', () => {
      layout({ forum: withSchema(['Post', '']) })

      scanAllPackages(registry, '/packages')

      expect(registry.has('forum:')).toBe(false)
    })

    it('accepts an empty entity list without error', () => {
      layout({ forum: withSchema([]) })

      const result = scanAllPackages(registry, '/packages')

      expect(result.scanned).toBe(1)
      expect(result.queued).toBe(0)
      expect(result.errors).toEqual([])
    })
  })
})
