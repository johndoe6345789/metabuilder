import { describe, expect, it } from 'vitest'

import { buildTenantContextValue, combinePackages } from './tenant-context-value'

describe('combinePackages', () => {
  it('puts the primary package first', () => {
    expect(combinePackages('blog', [])).toEqual([{ id: 'blog' }])
  })

  it('appends the dependencies after it', () => {
    expect(combinePackages('blog', [{ id: 'auth' }])).toEqual([
      { id: 'blog' },
      { id: 'auth' },
    ])
  })

  // A page cannot see the same package twice under two different roles.
  it('drops a dependency that repeats the primary package', () => {
    expect(combinePackages('blog', [{ id: 'blog', primary: false }])).toEqual([
      { id: 'blog' },
    ])
  })

  it('keeps the first occurrence when a dependency repeats another', () => {
    expect(
      combinePackages('blog', [
        { id: 'auth', name: 'first' },
        { id: 'auth', name: 'second' },
      ])
    ).toEqual([{ id: 'blog' }, { id: 'auth', name: 'first' }])
  })
})

describe('buildTenantContextValue', () => {
  const packages = combinePackages('blog', [{ id: 'auth' }])
  const value = buildTenantContextValue('acme', 'blog', packages)

  it('carries the tenant and the primary package under both names', () => {
    expect(value.tenant).toBe('acme')
    expect(value.primaryPackage).toBe('blog')
    expect(value.packageId).toBe('blog')
  })

  // The bug this pins: getPrefixedEntity(entity, prefix) takes the entity
  // first. Calling it as (packageId, entity) silently swapped the two,
  // producing "User_blog" instead of "blog_User".
  it('prefixes an entity with the primary package, not the other way round', () => {
    expect(value.getPrefixedEntity('User')).toBe('blog_User')
  })

  it('names a table scoped to the primary package', () => {
    expect(value.getTableName('User')).toBe('blog_user')
  })

  it('prefixes an entity for a named package, not the primary one', () => {
    expect(value.getPrefixedEntityForPackage('auth', 'Session')).toBe(
      'auth_Session'
    )
  })

  describe('buildApiUrl', () => {
    it('targets the primary package by default', () => {
      expect(value.buildApiUrl('User')).toBe('/api/v1/acme/blog/User')
    })

    it('appends an id and an action', () => {
      expect(value.buildApiUrl('User', 'u1', 'reset')).toBe(
        '/api/v1/acme/blog/User/u1/reset'
      )
    })

    it('targets a different package when asked', () => {
      expect(value.buildApiUrl('Session', undefined, undefined, 'auth')).toBe(
        '/api/v1/acme/auth/Session'
      )
    })
  })

  describe('hasPackage', () => {
    it('is true for the primary package', () => {
      expect(value.hasPackage('blog')).toBe(true)
    })

    it('is true for a dependency', () => {
      expect(value.hasPackage('auth')).toBe(true)
    })

    it('is false for a package the page never declared', () => {
      expect(value.hasPackage('media')).toBe(false)
    })
  })
})
