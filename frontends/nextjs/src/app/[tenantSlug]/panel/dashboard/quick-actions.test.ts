import { describe, expect, it } from 'vitest'

import { allQuickActions, quickActionsFor } from './quick-actions'

const GOD = '/acme/panel/god'

describe('allQuickActions', () => {
  it('places the god panel at the tenant-scoped path it was given', () => {
    const god = allQuickActions(GOD).find(a => a.title === 'God Panel')
    expect(god?.href).toBe(GOD)
  })

  it('gives every tile a title, icon and destination', () => {
    for (const action of allQuickActions(GOD)) {
      expect(action.title.length).toBeGreaterThan(0)
      expect(action.icon.length).toBeGreaterThan(0)
      expect(action.href.length).toBeGreaterThan(0)
    }
  })

  it('lists the tiles in ascending tier order', () => {
    const levels = allQuickActions(GOD).map(a => a.minLevel)
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
    expect(quickActionsFor(level, GOD).map(a => a.title)).toEqual(expected)
  })

  it('never shows a tile above the viewer\'s level', () => {
    for (const level of [1, 2, 3, 4, 5]) {
      for (const action of quickActionsFor(level, GOD)) {
        expect(action.minLevel).toBeLessThanOrEqual(level)
      }
    }
  })
})
