import { describe, expect, it } from 'vitest'

import { LEVEL_COLORS, LEVELS, levelColors, levelGradient } from './levels'

describe('LEVELS', () => {
  it('describes all five tiers, numbered 1 to 5', () => {
    expect(LEVELS.map(l => l.level)).toEqual([1, 2, 3, 4, 5])
  })

  it('gives every tier a colour pair', () => {
    for (const { level } of LEVELS) {
      expect(LEVEL_COLORS[level]).toBeDefined()
    }
  })

  it('gives every tier a name and a description', () => {
    for (const tier of LEVELS) {
      expect(tier.name.length).toBeGreaterThan(0)
      expect(tier.desc.length).toBeGreaterThan(0)
    }
  })
})

describe('levelColors', () => {
  it.each([1, 2, 3, 4, 5])('returns the declared pair for level %i', level => {
    expect(levelColors(level)).toEqual(LEVEL_COLORS[level as 1])
  })

  // An unknown level must still render, not crash the dashboard on a
  // role the colour table has never heard of.
  it.each([0, 6, -1, 99])('falls back to a neutral pair for %i', level => {
    const { from, to } = levelColors(level)
    expect(from).toMatch(/^#[0-9a-f]{6}$/i)
    expect(to).toMatch(/^#[0-9a-f]{6}$/i)
  })
})

describe('levelGradient', () => {
  it('builds a gradient from the pair', () => {
    expect(levelGradient(1)).toBe(
      `linear-gradient(135deg, ${LEVEL_COLORS[1].from} 0%, ${LEVEL_COLORS[1].to} 100%)`
    )
  })

  it('produces a valid gradient for an unknown level', () => {
    expect(levelGradient(99)).toMatch(/^linear-gradient\(135deg, #/)
  })
})
