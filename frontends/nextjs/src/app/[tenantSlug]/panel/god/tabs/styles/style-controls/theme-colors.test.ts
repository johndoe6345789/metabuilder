import { describe, it, expect } from 'vitest'
import { THEME_COLORS, themeColorValue } from './theme-colors'

describe('themeColorValue', () => {
  it('wraps the token in var()', () => {
    expect(themeColorValue('--mat-sys-primary')).toBe(
      'var(--mat-sys-primary)'
    )
  })
})

describe('THEME_COLORS', () => {
  it('gives every entry a label and a token', () => {
    for (const color of THEME_COLORS) {
      expect(color.label.length).toBeGreaterThan(0)
      expect(color.token.startsWith('--mat-sys-')).toBe(true)
    }
  })

  it('has no duplicate tokens', () => {
    const tokens = THEME_COLORS.map(c => c.token)
    expect(new Set(tokens).size).toBe(tokens.length)
  })
})
