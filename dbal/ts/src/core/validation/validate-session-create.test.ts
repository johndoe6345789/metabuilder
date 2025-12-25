import { describe, expect, it } from 'vitest'
import { validateSessionCreate } from './validate-session-create'

describe('validateSessionCreate', () => {
  const base = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    token: 'token-value',
    expiresAt: new Date('2024-01-01T00:00:00Z'),
  }

  it.each([
    { data: base },
  ])('accepts %s', ({ data }) => {
    expect(validateSessionCreate(data)).toEqual([])
  })

  it.each([
    { data: { ...base, userId: 'invalid' }, message: 'userId must be a valid UUID' },
    { data: { ...base, token: ' ' }, message: 'token must be a non-empty string' },
    { data: { ...base, expiresAt: 'not-a-date' }, message: 'expiresAt must be a valid date' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateSessionCreate(data)).toContain(message)
  })
})
