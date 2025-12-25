import { describe, expect, it } from 'vitest'
import { validateSessionCreate } from '../../../src/core/validation/validate-session-create'

describe('validateSessionCreate', () => {
  const base = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    token: 'token-value',
    expiresAt: new Date('2024-01-01T00:00:00Z'),
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateSessionCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, userId: 'invalid' }, message: 'userId must be a valid UUID' },
    { data: { ...base, token: ' ' }, message: 'token must be a non-empty string' },
    { data: { ...base, expiresAt: 'not-a-date' }, message: 'expiresAt must be a valid date' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateSessionCreate(data)).toContain(message)
  })
})
