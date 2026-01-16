import { describe, expect, it } from 'vitest'
import { validateSessionCreate } from '../../../../../src/core/validation/validate-session-create'

describe('validateSessionCreate', () => {
  const base = {
    userId: 'user-1',
    token: 'token-value',
    expiresAt: BigInt(1704067200000),
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateSessionCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, userId: ' ' }, message: 'userId must be a non-empty string' },
    { data: { ...base, token: ' ' }, message: 'token must be a non-empty string' },
    { data: { ...base, expiresAt: 'not-a-date' }, message: 'expiresAt must be a bigint timestamp' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateSessionCreate(data)).toContain(message)
  })
})
