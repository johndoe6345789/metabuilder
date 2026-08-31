import { describe, expect, it } from 'vitest'

import {
  normalizeJsonValue,
  normalizeOptionalJsonValue,
  normalizeSchema,
  pickNullableString,
} from './normalize-schema'

describe('pickNullableString', () => {
  it('passes through a string', () => {
    expect(pickNullableString('x')).toBe('x')
  })
  it('passes through null', () => {
    expect(pickNullableString(null)).toBeNull()
  })
  it('returns undefined for anything else', () => {
    expect(pickNullableString(42)).toBeUndefined()
    expect(pickNullableString(undefined)).toBeUndefined()
  })
})

describe('normalizeJsonValue', () => {
  it('passes through a string as-is', () => {
    expect(normalizeJsonValue('[1]', '[]')).toBe('[1]')
  })
  it('falls back for null/undefined', () => {
    expect(normalizeJsonValue(null, '[]')).toBe('[]')
    expect(normalizeJsonValue(undefined, '[]')).toBe('[]')
  })
  it('stringifies a non-string value', () => {
    expect(normalizeJsonValue([1, 2], '[]')).toBe('[1,2]')
  })
})

describe('normalizeOptionalJsonValue', () => {
  it('preserves the null/undefined distinction', () => {
    expect(normalizeOptionalJsonValue(null)).toBeNull()
    expect(normalizeOptionalJsonValue(undefined)).toBeUndefined()
  })
  it('passes through a string', () => {
    expect(normalizeOptionalJsonValue('x')).toBe('x')
  })
  it('stringifies an object', () => {
    expect(normalizeOptionalJsonValue({ a: 1 })).toBe('{"a":1}')
  })
})

describe('normalizeSchema', () => {
  it('returns null with no usable name', () => {
    expect(normalizeSchema({})).toBeNull()
    expect(normalizeSchema({ name: '' })).toBeNull()
  })

  it('defaults id to the name when none is given', () => {
    expect(normalizeSchema({ name: 'User' })?.id).toBe('User')
  })

  it('keeps an explicit id', () => {
    expect(normalizeSchema({ name: 'User', id: 'u1' })?.id).toBe('u1')
  })

  it('carries optional string fields through', () => {
    const schema = normalizeSchema({ name: 'User', label: 'A user' })
    expect(schema?.label).toBe('A user')
  })

  it('omits an optional field entirely when it was never provided', () => {
    const schema = normalizeSchema({ name: 'User' })
    expect(Object.hasOwn(schema ?? {}, 'label')).toBe(false)
  })

  it('carries optional JSON fields through, stringified', () => {
    const schema = normalizeSchema({ name: 'User', ordering: ['id'] })
    expect(schema?.ordering).toBe('["id"]')
  })
})
