import { describe, expect, it } from 'vitest'
import { sanitizeIdentifier } from './sanitizeIdentifier'

describe('sanitizeIdentifier', () => {
  it('lowercases and replaces spaces with underscores', () => {
    expect(sanitizeIdentifier('Hello World')).toBe('hello_world')
  })

  it('replaces non-alphanumeric characters with underscores', () => {
    expect(sanitizeIdentifier('foo-bar.baz')).toBe('foo_bar_baz')
  })

  it('collapses consecutive underscores', () => {
    expect(sanitizeIdentifier('foo---bar')).toBe('foo_bar')
  })

  it('strips leading and trailing underscores', () => {
    expect(sanitizeIdentifier('  foo  ')).toBe('foo')
  })

  it('returns fallback for empty string', () => {
    expect(sanitizeIdentifier('')).toBe('identifier')
  })

  it('returns custom fallback when provided', () => {
    expect(sanitizeIdentifier('', { fallback: 'default' })).toBe('default')
  })

  it('prefixes numeric-leading identifiers with underscore', () => {
    expect(sanitizeIdentifier('2fa')).toBe('_2fa')
    expect(sanitizeIdentifier('123abc')).toBe('_123abc')
  })

  it('handles strings that are purely special chars (returns fallback)', () => {
    expect(sanitizeIdentifier('---')).toBe('identifier')
  })

  it('preserves already valid identifiers', () => {
    expect(sanitizeIdentifier('user_auth')).toBe('user_auth')
  })

  it('handles mixed case with spaces and dots', () => {
    expect(sanitizeIdentifier('User Auth')).toBe('user_auth')
    expect(sanitizeIdentifier('user.v1')).toBe('user_v1')
  })

  it('uses default fallback of "identifier" when no options passed', () => {
    expect(sanitizeIdentifier('!!!')).toBe('identifier')
  })
})
