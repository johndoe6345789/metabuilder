import { describe, expect, it } from 'vitest'
import { CommonSchemas } from './common-schemas'

describe('CommonSchemas', () => {
  it.each(['abc', 'a-b-c', 'a1'])('accepts the slug %p', slug => {
    expect(CommonSchemas.slug.safeParse(slug).success).toBe(true)
  })

  it.each(['Abc', 'a_b', 'a b', 'a.b', ''])('rejects the slug %p', slug => {
    expect(CommonSchemas.slug.safeParse(slug).success).toBe(false)
  })

  it('rejects an id longer than 64 characters', () => {
    expect(CommonSchemas.id.safeParse('a'.repeat(65)).success).toBe(false)
    expect(CommonSchemas.id.safeParse('a'.repeat(64)).success).toBe(true)
  })

  it.each([1, 100])('accepts the positive integer %i', value => {
    expect(CommonSchemas.positiveInt.safeParse(value).success).toBe(true)
  })

  it.each([0, -1, 1.5])('rejects %p as a positive integer', value => {
    expect(CommonSchemas.positiveInt.safeParse(value).success).toBe(false)
  })

  it('accepts zero as a non-negative integer', () => {
    expect(CommonSchemas.nonNegativeInt.safeParse(0).success).toBe(true)
  })

  it.each([1700000000000, 1700000000000n, '1700000000000'])(
    'accepts the timestamp %p',
    value => {
      expect(CommonSchemas.timestamp.safeParse(value).success).toBe(true)
    }
  )

  it.each([true, false, 'true', 'false'])(
    'accepts the boolean-like %p',
    value => {
      expect(CommonSchemas.booleanLike.safeParse(value).success).toBe(true)
    }
  )

  it('coerces the strings to real booleans', () => {
    expect(CommonSchemas.booleanLike.parse('true')).toBe(true)
    expect(CommonSchemas.booleanLike.parse('false')).toBe(false)
  })

  it.each(['yes', '1', 'TRUE'])('rejects %p as boolean-like', value => {
    expect(CommonSchemas.booleanLike.safeParse(value).success).toBe(false)
  })

  it('accepts a string that really is JSON', () => {
    expect(CommonSchemas.jsonString.safeParse('{"a":1}').success).toBe(true)
    expect(CommonSchemas.jsonString.safeParse('{ not json').success).toBe(
      false
    )
  })

  it('defaults pagination rather than failing on an empty query', () => {
    expect(CommonSchemas.pagination.parse({})).toEqual({
      page: 1,
      perPage: 20,
    })
  })

  it('coerces pagination from query strings', () => {
    expect(
      CommonSchemas.pagination.parse({ page: '3', perPage: '50' })
    ).toEqual({ page: 3, perPage: 50 })
  })

  // An unbounded page size is a way to ask for the whole table at once.
  it('caps the page size', () => {
    expect(CommonSchemas.pagination.safeParse({ perPage: 101 }).success).toBe(
      false
    )
  })
})
