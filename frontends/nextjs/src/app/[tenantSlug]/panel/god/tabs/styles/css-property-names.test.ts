import { describe, expect, it } from 'vitest'
import { MANAGED_PROPS } from './style-controls/groups'
import { CSS_PROPERTY_SUGGESTIONS } from './css-property-names'

describe('CSS_PROPERTY_SUGGESTIONS', () => {
  it('never suggests a property the visual controls already manage', () => {
    for (const prop of CSS_PROPERTY_SUGGESTIONS) {
      expect(MANAGED_PROPS.has(prop)).toBe(false)
    }
  })

  it('has no duplicates', () => {
    expect(new Set(CSS_PROPERTY_SUGGESTIONS).size).toBe(
      CSS_PROPERTY_SUGGESTIONS.length
    )
  })

  it('offers a reasonable range of common properties', () => {
    expect(CSS_PROPERTY_SUGGESTIONS).toContain('display')
    expect(CSS_PROPERTY_SUGGESTIONS).toContain('gap')
    expect(CSS_PROPERTY_SUGGESTIONS).toContain('transform')
  })
})
