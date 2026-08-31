import { describe, expect, it } from 'vitest'

import { categorizeError } from './error-category'

describe('categorizeError by status code', () => {
  it.each([
    [401, 'authentication'],
    [403, 'permission'],
    [404, 'not-found'],
    [409, 'conflict'],
    [429, 'rate-limit'],
    [408, 'timeout'],
    [500, 'server'],
    [503, 'server'],
  ] as const)('maps status %i to %s', (status, category) => {
    expect(categorizeError('oops', status)).toBe(category)
  })

  it('falls through to keyword matching for an unmapped sub-500 status', () => {
    expect(categorizeError('network down', 402)).toBe('network')
  })

  it('treats any status 500 or above as server, mapped or not', () => {
    expect(categorizeError('mystery failure', 999)).toBe('server')
  })
})

describe('categorizeError by message keyword', () => {
  it.each([
    ['Network request failed', 'network'],
    ['Unauthorized access', 'authentication'],
    ['Permission denied', 'permission'],
    ['Item not found', 'not-found'],
    ['Duplicate conflict', 'conflict'],
    ['Too many requests', 'rate-limit'],
    ['Request timed out', 'timeout'],
    ['Validation failed', 'validation'],
    ['Internal server error', 'server'],
  ])('categorizes "%s" as %s', (message, category) => {
    expect(categorizeError(message)).toBe(category)
  })

  it('is case-insensitive', () => {
    expect(categorizeError('NETWORK ERROR')).toBe('network')
  })

  it('accepts an Error object', () => {
    expect(categorizeError(new Error('permission denied'))).toBe('permission')
  })

  it('falls back to unknown for an unrecognized message', () => {
    expect(categorizeError('something odd happened')).toBe('unknown')
  })
})
