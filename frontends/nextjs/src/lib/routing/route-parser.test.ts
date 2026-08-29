import { describe, expect, it } from 'vitest'

import {
  getPrefixedEntity,
  getTableName,
  isReservedPath,
  parseRoute,
  RESERVED_PATHS,
} from './route-parser'

describe('isReservedPath', () => {
  it.each(RESERVED_PATHS)('reserves %s', path => {
    expect(isReservedPath(path)).toBe(true)
  })

  it('reads only the first segment', () => {
    expect(isReservedPath('api/v1/things')).toBe(true)
    expect(isReservedPath('acme/api')).toBe(false)
  })

  it('accepts a leading slash', () => {
    expect(isReservedPath('/api')).toBe(true)
  })

  it.each(['acme', 'tenant1', '', 'apiary'])(
    'does not reserve %p',
    path => {
      expect(isReservedPath(path)).toBe(false)
    }
  )
})

describe('parseRoute', () => {
  it('reads tenant, package and path from the segments', () => {
    expect(parseRoute('/acme/blog/posts/1')).toEqual({
      tenant: 'acme',
      package: 'blog',
      path: '/posts/1',
      b_params: {},
    })
  })

  it('reads a tenant alone', () => {
    expect(parseRoute('/acme')).toEqual({ tenant: 'acme', b_params: {} })
  })

  it('reads a tenant and package with no rest', () => {
    expect(parseRoute('/acme/blog')).toEqual({
      tenant: 'acme',
      package: 'blog',
      b_params: {},
    })
  })

  // A reserved first segment is an application route, not a tenant, so it
  // must not be read as one.
  it.each(RESERVED_PATHS)('does not read %s as a tenant', reserved => {
    expect(parseRoute(`/${reserved}/thing`).tenant).toBeUndefined()
  })

  it('still reads the package after a reserved first segment', () => {
    expect(parseRoute('/api/things').package).toBe('things')
  })

  it('parses query parameters', () => {
    expect(parseRoute('/acme/blog?limit=10&sort=name').b_params).toEqual({
      limit: '10',
      sort: 'name',
    })
  })

  it('decodes an encoded parameter', () => {
    expect(parseRoute('/acme?q=a%20b').b_params.q).toBe('a b')
  })

  it.each(['', '/', '//', '///'])('gives an empty route for %p', url => {
    expect(parseRoute(url)).toEqual({ b_params: {} })
  })

  it('ignores an empty query string', () => {
    expect(parseRoute('/acme?').b_params).toEqual({})
  })

  it('ignores repeated separators between segments', () => {
    expect(parseRoute('//acme//blog//')).toMatchObject({
      tenant: 'acme',
      package: 'blog',
    })
  })
})

describe('getPrefixedEntity', () => {
  it('prefixes when there is one', () => {
    expect(getPrefixedEntity('User', 'blog')).toBe('blog_User')
  })

  it.each([undefined, ''])('leaves the entity alone for %p', prefix => {
    expect(getPrefixedEntity('User', prefix)).toBe('User')
  })
})

describe('getTableName', () => {
  it('lowercases the entity', () => {
    expect(getTableName('PageConfig')).toBe('pageconfig')
  })

  it('prefixes with the tenant when there is one', () => {
    expect(getTableName('User', 'acme')).toBe('acme_user')
  })

  it.each([undefined, ''])('does not prefix for %p', tenantId => {
    expect(getTableName('User', tenantId)).toBe('user')
  })
})
