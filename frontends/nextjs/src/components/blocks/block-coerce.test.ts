import { describe, expect, it } from 'vitest'

import {
  isRecord,
  propDirection,
  propGap,
  propNumber,
  propText,
} from './block-coerce'

describe('propText', () => {
  it.each([
    ['a string', 'hi', 'hi'],
    ['a number', 7, '7'],
    ['zero', 0, '0'],
    ['false', false, 'false'],
  ])('renders %s', (_label, input, expected) => {
    expect(propText(input)).toBe(expected)
  })

  it.each([[null], [undefined], [{}], [[]], [() => 1]])(
    'falls back for %p, which has no sensible text form',
    input => {
      expect(propText(input, 'fallback')).toBe('fallback')
    }
  )

  it('defaults the fallback to an empty string', () => {
    expect(propText(null)).toBe('')
  })
})

describe('isRecord', () => {
  it('accepts a plain object', () => {
    expect(isRecord({ a: 1 })).toBe(true)
  })

  it.each([[null], [undefined], [[]], ['s'], [1]])(
    'rejects %p',
    value => {
      expect(isRecord(value)).toBe(false)
    }
  )

  it('rejects an array, which would spread into numeric keys', () => {
    expect(isRecord([1, 2])).toBe(false)
  })
})

describe('propDirection', () => {
  it('takes row when asked for row', () => {
    expect(propDirection('row')).toBe('row')
  })

  it.each([['column'], ['ROW'], [null], [undefined], [1]])(
    'defaults %p to column',
    value => {
      expect(propDirection(value)).toBe('column')
    }
  )
})

describe('propGap', () => {
  it('keeps a number, including zero', () => {
    expect(propGap(0)).toBe(0)
    expect(propGap(24)).toBe(24)
  })

  it.each([['12'], [null], [undefined]])('defaults %p to 12', value => {
    expect(propGap(value)).toBe(12)
  })
})

describe('propNumber', () => {
  it('keeps a number', () => {
    expect(propNumber(3, 9)).toBe(3)
  })

  it('uses the caller fallback for a numeric string', () => {
    // The builder stores numbers as numbers; a string here means the prop
    // was never coerced, so the block default is the safer answer.
    expect(propNumber('3', 9)).toBe(9)
  })
})
