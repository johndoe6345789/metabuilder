import { describe, expect, it } from 'vitest'

import {
  buildStats,
  COMMENTS_URL,
  countElevated,
  matchesSearch,
  USERS_URL,
  type UserRecord,
} from './admin-types'

const user = (over: Partial<UserRecord> = {}): UserRecord => ({
  id: '1',
  username: 'alice',
  email: 'alice@example.com',
  role: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
})

describe('entity URLs', () => {
  // Entity names come from the schema's `entity` field in PascalCase, not
  // from the filename -- this panel used to request `core/user`, which
  // matches no route at all, so every load fell through to the fallback.
  it('addresses the User entity in PascalCase', () => {
    expect(USERS_URL).toMatch(/\/system\/core\/User$/)
  })

  it('addresses ProfileComment under the pastebin package', () => {
    expect(COMMENTS_URL).toMatch(/\/system\/pastebin\/ProfileComment$/)
  })
})

describe('countElevated', () => {
  it('counts admins and gods', () => {
    expect(
      countElevated([
        user({ role: 'admin' }),
        user({ role: 'god' }),
        user({ role: 'user' }),
      ])
    ).toBe(2)
  })

  it('is zero for an empty list', () => {
    expect(countElevated([])).toBe(0)
  })

  it('does not count a role that merely contains "admin"', () => {
    expect(countElevated([user({ role: 'administrator' })])).toBe(0)
  })
})

describe('buildStats', () => {
  it('reports the three headline counts', () => {
    const stats = buildStats([user(), user({ role: 'admin' })], 7)
    expect(stats.map(s => [s.label, s.count])).toEqual([
      ['Total Users', 2],
      ['Total Comments', 7],
      ['Admin Users', 1],
    ])
  })

  it('reports zeros rather than blanks with nothing loaded', () => {
    expect(buildStats([], 0).every(s => s.count === 0)).toBe(true)
  })
})

describe('matchesSearch', () => {
  it('matches everything when the search is empty', () => {
    expect(matchesSearch(user(), '')).toBe(true)
    expect(matchesSearch(user(), '   ')).toBe(true)
  })

  it('matches on the username, case-insensitively', () => {
    expect(matchesSearch(user(), 'ALI')).toBe(true)
  })

  it('matches on the email address', () => {
    expect(matchesSearch(user(), 'example.com')).toBe(true)
  })

  it('does not match an unrelated needle', () => {
    expect(matchesSearch(user(), 'bob')).toBe(false)
  })

  it('ignores surrounding whitespace in the needle', () => {
    expect(matchesSearch(user(), '  alice  ')).toBe(true)
  })
})
