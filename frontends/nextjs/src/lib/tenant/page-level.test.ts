import { describe, expect, it } from 'vitest'

import { parsePageLevel } from './page-level'

/**
 * A page's access level had three readers and three different rules:
 * workspace-slot-data and use-load-page both fell back to 0 (public) for
 * anything that was not a JS number, and fetch-tenant-page cast the field
 * to `number` and fell back to 1.
 *
 * That matters because the field does not always arrive as a number. The
 * SQLite adapter emits a JSON number only for columns it has typed as
 * number or bigint, and PageConfig.level is declared "integer" -- so a
 * founder's Admin-only page arrives as the string "3", is not a number,
 * and gates at 0. LevelGate is then asked to keep anonymous visitors out
 * with minLevel 0, which is to say not at all.
 */
describe('reading the level a founder set on a page', () => {
  it('takes a number', () => {
    expect(parsePageLevel(3)).toBe(3)
  })

  // The whole point: this used to become 0, i.e. public.
  it('takes the same number written as a string', () => {
    expect(parsePageLevel('3')).toBe(3)
  })

  it('treats a row that never declared a level as public', () => {
    expect(parsePageLevel(undefined)).toBe(0)
    expect(parsePageLevel(null)).toBe(0)
    expect(parsePageLevel('')).toBe(0)
  })

  // A value that is set but unreadable is not a public page -- it is a
  // page whose rule we could not read, and the closed answer is the safe
  // one. Failing open here publishes somebody's private page.
  it('fails closed on a value it cannot read', () => {
    expect(parsePageLevel('yes')).toBe(Number.MAX_SAFE_INTEGER)
    expect(parsePageLevel({})).toBe(Number.MAX_SAFE_INTEGER)
    expect(parsePageLevel(Number.NaN)).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('does not let a negative level open a page further than public', () => {
    expect(parsePageLevel(-5)).toBe(0)
  })
})
