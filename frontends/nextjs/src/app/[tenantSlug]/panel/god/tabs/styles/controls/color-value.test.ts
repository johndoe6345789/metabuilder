import { describe, expect, it } from 'vitest'

import { isThemedColor } from './color-value'

describe('isThemedColor', () => {
  it('recognises a CSS variable reference as themed', () => {
    expect(isThemedColor('var(--color-primary)')).toBe(true)
  })

  it('treats a hex value as custom, not themed', () => {
    expect(isThemedColor('#ff0000')).toBe(false)
  })

  it('treats an empty value as not themed', () => {
    expect(isThemedColor('')).toBe(false)
  })

  it('treats an undefined value as not themed', () => {
    expect(isThemedColor(undefined)).toBe(false)
  })
})
