import { describe, expect, it } from 'vitest'

import { recoverySuggestions, suggestionFor } from './suggestions'

const err = (code: string) => ({ code, message: '', path: '' }) as never

describe('suggestionFor', () => {
  it.each([
    'MISSING_REQUIRED_FIELD',
    'INVALID_NODE_TYPE',
    'INVALID_CONNECTION_TARGET_NODE',
    'TYPE_MISMATCH',
    'MISSING_TENANT_ID',
    'TIMEOUT_TOO_SHORT',
    'DUPLICATE_NODE_NAME',
    'CIRCULAR_DEPENDENCY',
  ])('has specific advice for %s', code => {
    expect(suggestionFor(err(code))).not.toBe(
      'Fix this validation issue and retry.'
    )
  })

  it('matches a lowercase code', () => {
    expect(suggestionFor(err('type_mismatch'))).toBe(
      'Change parameter type to match definition.'
    )
  })

  it('falls back to generic advice for an unknown code', () => {
    expect(suggestionFor(err('WHO_KNOWS'))).toBe(
      'Fix this validation issue and retry.'
    )
  })
})

describe('recoverySuggestions', () => {
  it('is empty when there is nothing wrong', () => {
    expect(recoverySuggestions([])).toEqual([])
  })

  it('does not repeat the same advice twice', () => {
    expect(
      recoverySuggestions([
        err('TYPE_MISMATCH'),
        err('TYPE_MISMATCH'),
        err('MISSING_TENANT_ID'),
      ])
    ).toHaveLength(2)
  })

  // Enough to act on, not a wall of text.
  it('caps the list at five', () => {
    const codes = [
      'MISSING_REQUIRED_FIELD',
      'INVALID_NODE_TYPE',
      'TYPE_MISMATCH',
      'MISSING_TENANT_ID',
      'TIMEOUT_TOO_SHORT',
      'DUPLICATE_NODE_NAME',
      'CIRCULAR_DEPENDENCY',
    ]
    expect(recoverySuggestions(codes.map(err))).toHaveLength(5)
  })
})
