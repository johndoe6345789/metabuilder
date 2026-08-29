import { describe, expect, it } from 'vitest'

import { COMMON_PROP_KEYS, commonAttrs } from './common-attrs'

describe('commonAttrs', () => {
  it('passes through the props that are already DOM attributes', () => {
    expect(
      commonAttrs({ id: 'a', name: 'n', className: 'c', role: 'main' })
    ).toEqual({ id: 'a', name: 'n', className: 'c', role: 'main' })
  })

  it('renames the props whose DOM attribute differs', () => {
    expect(
      commonAttrs({
        ariaLabel: 'L',
        ariaDescribedby: 'd',
        ariaHidden: 'true',
        testId: 't',
      })
    ).toEqual({
      'aria-label': 'L',
      'aria-describedby': 'd',
      'aria-hidden': 'true',
      'data-testid': 't',
    })
  })

  it('makes tabIndex a number, since React rejects a string', () => {
    expect(commonAttrs({ tabIndex: '-1' })).toEqual({ tabIndex: -1 })
  })

  it.each([[undefined], [null], ['']])('omits a %p value', value => {
    expect(commonAttrs({ id: value })).toEqual({})
  })

  it('keeps other falsy values that are still meaningful', () => {
    expect(commonAttrs({ tabIndex: 0 })).toEqual({ tabIndex: 0 })
  })

  it('ignores props it does not own', () => {
    // Block-specific props must reach render(), not the DOM.
    expect(commonAttrs({ text: 'hi', variant: 'contained' })).toEqual({})
  })

  it('does not carry title, which three blocks use as content', () => {
    expect(COMMON_PROP_KEYS).not.toContain('title')
    expect(commonAttrs({ title: 'x' })).toEqual({})
  })

  it('returns a fresh object each call', () => {
    expect(commonAttrs({ id: 'a' })).not.toBe(commonAttrs({ id: 'a' }))
  })
})
