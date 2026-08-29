import { describe, expect, it } from 'vitest'

import { findOrFirst, firstOf } from './first-of'

describe('firstOf', () => {
  it('returns the first element', () => {
    expect(firstOf([1, 2, 3], 'numbers')).toBe(1)
  })

  it('throws with a name when the list is empty', () => {
    // Failing loudly beats an undefined reaching the render.
    expect(() => firstOf([], 'panel tabs')).toThrow(
      'panel tabs must not be empty'
    )
  })

  it('returns a falsy first element rather than treating it as missing', () => {
    expect(firstOf([0], 'numbers')).toBe(0)
    expect(firstOf([''], 'strings')).toBe('')
  })
})

describe('findOrFirst', () => {
  const tabs = [{ id: 'a' }, { id: 'b' }]

  it('returns the match when there is one', () => {
    expect(findOrFirst(tabs, t => t.id === 'b', 'tabs')).toEqual({ id: 'b' })
  })

  it('falls back to the first when nothing matches', () => {
    expect(findOrFirst(tabs, t => t.id === 'z', 'tabs')).toEqual({ id: 'a' })
  })

  it('throws when nothing matches and there is no first', () => {
    expect(() => findOrFirst([], () => true, 'tabs')).toThrow(
      'must not be empty'
    )
  })
})
