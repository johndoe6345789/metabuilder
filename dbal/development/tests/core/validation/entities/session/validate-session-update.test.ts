import { describe, expect, it } from 'vitest'
import { validateSessionUpdate } from '../../../src/core/validation/validate-session-update'

describe('validateSessionUpdate', () => {
  it.each([
    { data: { expiresAt: '2024-01-01T00:00:00Z' }, expected: [] },
    { data: { lastActivity: new Date('2024-01-01T00:00:00Z') }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateSessionUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { userId: 'invalid' }, message: 'userId must be a valid UUID' },
    { data: { token: '' }, message: 'token must be a non-empty string' },
    { data: { lastActivity: 'not-a-date' }, message: 'lastActivity must be a valid date' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateSessionUpdate(data)).toContain(message)
  })
})
