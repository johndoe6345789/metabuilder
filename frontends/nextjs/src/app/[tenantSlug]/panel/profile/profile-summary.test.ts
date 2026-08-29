import { describe, expect, it } from 'vitest'

import { formatJoined, summarise } from './profile-summary'

describe('formatJoined', () => {
  it('formats a timestamp a person can read', () => {
    expect(formatJoined(Date.UTC(2026, 0, 15))).toMatch(/2026/)
  })

  it('formats an ISO string', () => {
    expect(formatJoined('2026-01-15T00:00:00.000Z')).toMatch(/2026/)
  })

  it.each([null, '', 'not a date', NaN])(
    'says the date is not recorded for %p',
    value => {
      expect(formatJoined(value as string)).toBe('Not recorded')
    }
  )
})

describe('summarise', () => {
  it('reads the fields off the user', () => {
    expect(
      summarise(
        {
          username: 'alice',
          email: 'a@b.c',
          role: 'admin',
          createdAt: Date.UTC(2026, 0, 15),
        },
        3
      )
    ).toMatchObject({
      username: 'alice',
      email: 'a@b.c',
      role: 'admin',
      roleLevel: 3,
      initial: 'A',
    })
  })

  it('falls back to placeholders for a missing user', () => {
    expect(summarise(null, 1)).toMatchObject({
      username: 'User',
      email: '',
      role: 'user',
      initial: 'U',
      joined: 'Not recorded',
    })
  })

  it('uppercases the initial from a lowercase name', () => {
    expect(summarise({ username: 'zoe' }, 1).initial).toBe('Z')
  })
})
