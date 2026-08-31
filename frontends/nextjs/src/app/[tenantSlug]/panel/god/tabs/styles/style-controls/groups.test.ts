import { describe, it, expect } from 'vitest'
import { STYLE_GROUPS, MANAGED_PROPS } from './groups'

describe('STYLE_GROUPS', () => {
  it('gives every group a unique id', () => {
    const ids = STYLE_GROUPS.map(g => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every control within a group a unique CSS property', () => {
    for (const group of STYLE_GROUPS) {
      const props = group.controls.map(c => c.prop)
      expect(new Set(props).size).toBe(props.length)
    }
  })

  it('gives every choice control at least one option', () => {
    for (const group of STYLE_GROUPS) {
      for (const control of group.controls) {
        if (control.kind === 'choice') {
          expect(control.options.length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('MANAGED_PROPS', () => {
  it('includes every property named by every group', () => {
    for (const group of STYLE_GROUPS) {
      for (const control of group.controls) {
        expect(MANAGED_PROPS.has(control.prop)).toBe(true)
      }
    }
  })

  it('has exactly as many entries as there are distinct props', () => {
    const allProps = STYLE_GROUPS.flatMap(g => g.controls.map(c => c.prop))
    expect(MANAGED_PROPS.size).toBe(new Set(allProps).size)
  })
})
