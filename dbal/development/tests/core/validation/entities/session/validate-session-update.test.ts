import { describe, expect, it } from 'vitest'
import { validateSessionUpdate } from '../../../../../src/core/validation/validate-session-update'

describe('validateSessionUpdate', () => {
  it.each([
    { data: { expiresAt: BigInt(1704067200000) }, expected: [] },
    { data: { lastActivity: BigInt(1704067200000) }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateSessionUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { userId: ' ' }, message: 'userId must be a non-empty string' },
    { data: { token: '' }, message: 'token must be a non-empty string' },
    { data: { lastActivity: 'not-a-bigint' }, message: 'lastActivity must be a bigint timestamp' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateSessionUpdate(data)).toContain(message)
  })
})
