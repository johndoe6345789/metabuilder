import { describe, expect, it } from 'vitest'

import { allQuickActions, quickActionsFor } from './quick-actions'

const GOD = '/acme/panel/god'
const TENANT = 'acme'

describe('allQuickActions', () => {
  it('places the god panel under the tenant', () => {
    const god = allQuickActions(TENANT).find(a => a.title === 'God Panel')
    expect(god?.href).toBe(GOD)
  })

  /**
   * These were plain workspace paths -- '/profile', '/comments', '/admin',
   * '/super-god-panel'. Under basePath '/app' that resolves to
   * /app/profile, which Next matches as tenantSlug "profile", finds no such
   * tenant, and 404s. Three of the four tiles a founder sees on their very
   * first screen were dead; only the God Panel, which was handed a ready-
   * made path, worked.
   */
  it('sends every tile into the tenant, not to a bare workspace path', () => {
    for (const action of allQuickActions(TENANT)) {
      expect(action.href.startsWith('/acme/')).toBe(true)
    }
  })

  it('follows the tenant it is given', () => {
    const hrefs = allQuickActions('harbour_cycle_works').map(a => a.href)
    expect(hrefs.every(h => h.startsWith('/harbour_cycle_works/'))).toBe(true)
  })

  it('gives every tile a title, icon and destination', () => {
    for (const action of allQuickActions(TENANT)) {
      expect(action.title.length).toBeGreaterThan(0)
      expect(action.icon.length).toBeGreaterThan(0)
      expect(action.href.length).toBeGreaterThan(0)
    }
  })

  it('lists the tiles in ascending tier order', () => {
    const levels = allQuickActions(TENANT).map(a => a.minLevel)
    expect(levels).toEqual([...levels].sort((a, b) => a - b))
  })
})

describe('quickActionsFor', () => {
  // A tile the viewer cannot open is not shown at all, rather than shown
  // and then refused by the route behind it.
  it.each([
    [0, []],
    [1, ['Profile', 'Comments']],
    [2, ['Profile', 'Comments']],
    [3, ['Profile', 'Comments', 'Admin Panel']],
    [4, ['Profile', 'Comments', 'Admin Panel', 'God Panel']],
    [
      5,
      ['Profile', 'Comments', 'Admin Panel', 'God Panel', 'Super God'],
    ],
  ])('level %i unlocks %j', (level, expected) => {
    expect(quickActionsFor(level, TENANT).map(a => a.title)).toEqual(expected)
  })

  it('never shows a tile above the viewer\'s level', () => {
    for (const level of [1, 2, 3, 4, 5]) {
      for (const action of quickActionsFor(level, TENANT)) {
        expect(action.minLevel).toBeLessThanOrEqual(level)
      }
    }
  })
})
