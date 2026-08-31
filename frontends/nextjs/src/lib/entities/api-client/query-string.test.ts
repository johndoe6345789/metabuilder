import { describe, expect, it } from 'vitest'

import { buildQueryString } from './query-string'

describe('buildQueryString', () => {
  it('returns an empty string for no params', () => {
    expect(buildQueryString({})).toBe('')
  })

  it('encodes page and limit', () => {
    expect(buildQueryString({ page: 2, limit: 20 })).toBe('?page=2&limit=20')
  })

  it('encodes a filter as JSON', () => {
    const qs = buildQueryString({ filter: { published: true } })
    expect(qs).toBe(`?filter=${encodeURIComponent('{"published":true}')}`)
  })

  it('encodes sort', () => {
    expect(buildQueryString({ sort: '-createdAt' })).toBe('?sort=-createdAt')
  })

  it('combines multiple params', () => {
    const qs = buildQueryString({ page: 1, sort: 'name' })
    expect(qs).toBe('?page=1&sort=name')
  })
})
