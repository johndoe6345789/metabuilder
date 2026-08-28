import { describe, expect, it } from 'vitest'

import { parseRoute } from '@/lib/routing'

describe('parseRoute', () => {
  it('numbers the path segments', () => {
    expect(parseRoute('/system/core/User')).toEqual({
      segment0: 'system',
      segment1: 'core',
      segment2: 'User',
    })
  })

  it('ignores leading, trailing and repeated slashes', () => {
    expect(parseRoute('//system//core//')).toEqual({
      segment0: 'system',
      segment1: 'core',
    })
  })

  it('merges query parameters alongside the segments', () => {
    expect(parseRoute('/users?limit=10&sort=name')).toEqual({
      segment0: 'users',
      limit: '10',
      sort: 'name',
    })
  })

  it('decodes percent-encoded query values', () => {
    expect(parseRoute('/x?q=a%20b%26c').q).toBe('a b&c')
  })

  it('returns nothing for an empty path or a bare slash', () => {
    expect(parseRoute('')).toEqual({})
    expect(parseRoute('/')).toEqual({})
  })

  it('ignores an empty query string', () => {
    expect(parseRoute('/users?')).toEqual({ segment0: 'users' })
  })

  it('lets a query parameter shadow a segment key', () => {
    // Query params are applied first, so a later segment wins the name.
    expect(parseRoute('/a?segment0=q').segment0).toBe('a')
  })
})
