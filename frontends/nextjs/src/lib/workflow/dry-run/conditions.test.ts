import { describe, expect, it } from 'vitest'

import { evaluateCondition } from './conditions'

const holds = (value: unknown, is: string, other?: unknown) =>
  evaluateCondition(value, is, other).holds

describe('equals', () => {
  it('holds for the same text', () => {
    expect(holds('yes', 'equals', 'yes')).toBe(true)
  })

  it('does not hold for different text', () => {
    expect(holds('no', 'equals', 'yes')).toBe(false)
  })

  it('compares a number with the text of that number', () => {
    expect(holds(3, 'equals', '3')).toBe(true)
  })
})

describe('contains', () => {
  it('holds when the text is in there', () => {
    expect(holds('wheel building', 'contains', 'wheel')).toBe(true)
  })

  it('does not hold when it is not', () => {
    expect(holds('wheel', 'contains', 'frame')).toBe(false)
  })
})

describe('empty and not empty', () => {
  it.each([undefined, null, ''])('counts %p as empty', value => {
    expect(holds(value, 'empty')).toBe(true)
    expect(holds(value, 'not empty')).toBe(false)
  })

  it('counts a value as not empty', () => {
    expect(holds('Rosa', 'not empty')).toBe(true)
    expect(holds('Rosa', 'empty')).toBe(false)
  })
})

describe('a test nobody implemented', () => {
  /**
   * The steps after a condition are the ones that write rows. A test
   * nothing can evaluate has not passed, so the run stops rather than
   * carrying on into them.
   */
  it('does not hold, and says why', () => {
    const outcome = evaluateCondition('x', 'is bigger than', 'y')
    expect(outcome.holds).toBe(false)
    expect(outcome.because).toContain('no such test')
  })

  it('ignores the case and spacing a founder typed', () => {
    expect(holds('yes', ' Equals ', 'yes')).toBe(true)
  })
})
