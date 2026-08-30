import { describe, expect, it } from 'vitest'

import { parseWorkflowListQuery } from './list-query'

const qs = (raw: string): URLSearchParams => new URLSearchParams(raw)

describe('parseWorkflowListQuery', () => {
  it('always scopes to the requested tenant', () => {
    expect(parseWorkflowListQuery(qs(''), 'acme').filter).toEqual({
      tenantId: 'acme',
    })
  })

  it('defaults limit to 50 and offset to 0', () => {
    const query = parseWorkflowListQuery(qs(''), 'acme')
    expect(query.limit).toBe(50)
    expect(query.offset).toBe(0)
  })

  it('takes a limit below the cap', () => {
    expect(parseWorkflowListQuery(qs('limit=10'), 'acme').limit).toBe(10)
  })

  // Otherwise a caller could ask for the whole table in one request.
  it('caps the limit at 100', () => {
    expect(parseWorkflowListQuery(qs('limit=5000'), 'acme').limit).toBe(100)
  })

  it('takes a real offset', () => {
    expect(parseWorkflowListQuery(qs('offset=20'), 'acme').offset).toBe(20)
  })

  // parseInt on garbage input yields NaN, and NaN silently poisons every
  // arithmetic comparison after it -- hasMore and Math.min both included.
  it.each(['abc', '', '-5'])(
    'falls back to the default limit for %p rather than NaN',
    limit => {
      expect(parseWorkflowListQuery(qs(`limit=${limit}`), 'acme').limit).toBe(
        50
      )
    }
  )

  it.each(['abc', '-5'])(
    'falls back to the default offset for %p rather than NaN',
    offset => {
      expect(
        parseWorkflowListQuery(qs(`offset=${offset}`), 'acme').offset
      ).toBe(0)
    }
  )

  it('accepts a category filter', () => {
    expect(
      parseWorkflowListQuery(qs('category=automation'), 'acme').filter
        .category
    ).toBe('automation')
  })

  it('omits category when none is given', () => {
    expect(parseWorkflowListQuery(qs(''), 'acme').filter).not.toHaveProperty(
      'category'
    )
  })

  it('splits tags into a trimmed list', () => {
    expect(
      parseWorkflowListQuery(qs('tags=a, b ,c'), 'acme').filter.tags
    ).toEqual({ $in: ['a', 'b', 'c'] })
  })

  it('omits tags for an empty tags param', () => {
    expect(parseWorkflowListQuery(qs('tags='), 'acme').filter).not.toHaveProperty(
      'tags'
    )
  })

  it.each([
    ['true', true],
    ['false', false],
  ])('reads active=%s as %s', (raw, expected) => {
    expect(parseWorkflowListQuery(qs(`active=${raw}`), 'acme').filter.active).toBe(
      expected
    )
  })

  it('omits active when it is not given', () => {
    expect(parseWorkflowListQuery(qs(''), 'acme').filter).not.toHaveProperty(
      'active'
    )
  })
})
