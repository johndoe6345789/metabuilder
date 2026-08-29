import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fsMock = vi.hoisted(() => {
  const files = new Map<string, string>()
  const readFileSync = (target: string): string => {
    const found = files.get(target)
    if (found === undefined) throw new Error(`ENOENT: ${target}`)
    return found
  }
  const promises = {
    readFile: async (target: string) => readFileSync(target),
  }
  return { files, readFileSync, promises }
})

vi.mock('fs', () => ({
  readFileSync: fsMock.readFileSync,
  promises: fsMock.promises,
  default: { readFileSync: fsMock.readFileSync, promises: fsMock.promises },
}))

import path from 'path'
import {
  canBePrimaryPackage,
  loadPackageMetadata,
  validatePackageRoute,
} from './validate-package-route'

const base = path.resolve(process.cwd(), 'packages')
const pkgJson = (id: string) => path.resolve(base, id, 'package.json')
const seedJson = (id: string) =>
  path.resolve(base, id, 'seed', 'metadata.json')

beforeEach(() => fsMock.files.clear())
afterEach(() => vi.clearAllMocks())

describe('validatePackageRoute — package id validation', () => {
  // Both metadata paths are built by joining the package id onto a base
  // directory, so a traversal sequence has to be refused before any read.
  it.each([
    ['../etc', 'a parent-directory hop'],
    ['..', 'a bare parent reference'],
    ['a/b', 'a path separator'],
    ['a\\b', 'a windows separator'],
    ['a/../../etc/passwd', 'a nested traversal'],
  ])('refuses %s (%s)', id => {
    const result = validatePackageRoute(id, 'Thing')
    expect(result.allowed).toBe(false)
    expect(result.error).toBe('Invalid package ID format')
  })

  it.each([
    ['Blog', 'an uppercase letter'],
    ['1blog', 'a leading digit'],
    ['_blog', 'a leading underscore'],
    ['blog-posts', 'a hyphen'],
    ['blog.posts', 'a dot'],
    ['blog posts', 'a space'],
    ['', 'an empty id'],
  ])('refuses %s (%s)', id => {
    expect(validatePackageRoute(id, 'Thing').allowed).toBe(false)
  })

  it('refuses an id longer than 64 characters', () => {
    expect(validatePackageRoute('a'.repeat(65), 'Thing').allowed).toBe(false)
  })

  it('accepts an id of exactly 64 characters', () => {
    expect(validatePackageRoute('a'.repeat(64), 'Thing').allowed).toBe(true)
  })

  it.each(['blog', 'blog_posts', 'a', 'a1_2b'])('accepts %s', id => {
    expect(validatePackageRoute(id, 'Thing').allowed).toBe(true)
  })
})

describe('validatePackageRoute — metadata', () => {
  it('allows any entity when the package has no metadata', () => {
    expect(validatePackageRoute('blog', 'Anything')).toEqual({ allowed: true })
  })

  it('reports the package name and minimum level', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ name: 'Blog', minLevel: 3 }))
    expect(validatePackageRoute('blog', 'Post').package).toEqual({
      name: 'Blog',
      minLevel: 3,
    })
  })

  it('omits fields the metadata states with the wrong type', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ name: 7, minLevel: 'high' }))
    expect(validatePackageRoute('blog', 'Post').package).toEqual({
      name: undefined,
      minLevel: undefined,
    })
  })

  it('allows an entity the schema declares', () => {
    fsMock.files.set(
      pkgJson('blog'),
      JSON.stringify({ name: 'Blog', schema: { entities: ['Post', 'Tag'] } })
    )
    expect(validatePackageRoute('blog', 'Post').allowed).toBe(true)
  })

  // The declared entity list is the package's own surface: reaching an
  // entity it never declared is what this refuses.
  it('refuses an entity the schema does not declare', () => {
    fsMock.files.set(
      pkgJson('blog'),
      JSON.stringify({ name: 'Blog', schema: { entities: ['Post'] } })
    )
    const result = validatePackageRoute('blog', 'Credential')
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Credential')
  })

  it('allows anything when the entity list is empty', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ schema: { entities: [] } }))
    expect(validatePackageRoute('blog', 'Anything').allowed).toBe(true)
  })

  it.each([
    ['a non-array entities field', { schema: { entities: 'Post' } }],
    ['a null schema', { schema: null }],
    ['a non-object schema', { schema: 'Post' }],
    ['no schema at all', { name: 'Blog' }],
  ])('allows anything given %s', (_label, metadata) => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify(metadata))
    expect(validatePackageRoute('blog', 'Anything').allowed).toBe(true)
  })

  it('ignores non-string members of the entity list', () => {
    fsMock.files.set(
      pkgJson('blog'),
      JSON.stringify({ schema: { entities: ['Post', 7, '', null] } })
    )
    expect(validatePackageRoute('blog', 'Post').allowed).toBe(true)
    expect(validatePackageRoute('blog', 'Tag').allowed).toBe(false)
  })

  it('falls back to seed metadata when package.json is absent', () => {
    fsMock.files.set(seedJson('blog'), JSON.stringify({ name: 'Seeded' }))
    expect(validatePackageRoute('blog', 'Post').package?.name).toBe('Seeded')
  })

  it('prefers package.json over seed metadata', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ name: 'Real' }))
    fsMock.files.set(seedJson('blog'), JSON.stringify({ name: 'Seeded' }))
    expect(validatePackageRoute('blog', 'Post').package?.name).toBe('Real')
  })

  it('treats unparseable metadata as absent', () => {
    fsMock.files.set(pkgJson('blog'), '{ not json')
    expect(validatePackageRoute('blog', 'Post')).toEqual({ allowed: true })
  })
})

describe('canBePrimaryPackage', () => {
  it('is true when the package declares no preference', () => {
    expect(canBePrimaryPackage('blog')).toBe(true)
  })

  it('honours an explicit false', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ primary: false }))
    expect(canBePrimaryPackage('blog')).toBe(false)
  })

  it('honours an explicit true', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ primary: true }))
    expect(canBePrimaryPackage('blog')).toBe(true)
  })

  it('ignores a non-boolean preference', () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ primary: 'yes' }))
    expect(canBePrimaryPackage('blog')).toBe(true)
  })
})

describe('loadPackageMetadata', () => {
  it('reads package.json when it is present', async () => {
    fsMock.files.set(pkgJson('blog'), JSON.stringify({ name: 'Blog' }))
    await expect(loadPackageMetadata('blog')).resolves.toEqual({
      name: 'Blog',
    })
  })

  it('falls back to seed metadata', async () => {
    fsMock.files.set(seedJson('blog'), JSON.stringify({ name: 'Seeded' }))
    await expect(loadPackageMetadata('blog')).resolves.toEqual({
      name: 'Seeded',
    })
  })

  it('is null when neither file exists', async () => {
    await expect(loadPackageMetadata('blog')).resolves.toBeNull()
  })
})
