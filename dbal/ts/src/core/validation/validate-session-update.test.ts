import { describe, expect, it } from 'vitest'
import { validateSessionUpdate } from './validate-session-update'

describe('validateSessionUpdate', () => {
  it.each([
    { data: { expiresAt: '2024-01-01T00:00:00Z' } },
    { data: { lastActivity: new Date('2024-01-01T00:00:00Z') } },
  ])('accepts %s', ({ data }) => {
    expect(validateSessionUpdate(data)).toEqual([])
  })

  it.each([
    { data: { userId: 'invalid' }, message: 'userId must be a valid UUID' },
    { data: { token: '' }, message: 'token must be a non-empty string' },
    { data: { lastActivity: 'not-a-date' }, message: 'lastActivity must be a valid date' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateSessionUpdate(data)).toContain(message)
  })
})
