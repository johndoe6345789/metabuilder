import { describe, expect, it } from 'vitest'

import { evaluateSimpleExpression } from './evaluate-simple-expression'
import type { RenderContext } from '../render-json-component'

const ctx = (over: Partial<RenderContext> = {}): RenderContext => ({
  props: {},
  state: {},
  ...over,
})

describe('property access', () => {
  it('reads a top-level context field', () => {
    expect(evaluateSimpleExpression('props', ctx())).toEqual({})
  })

  it('reads a nested property', () => {
    const context = ctx({ props: { title: 'Hi' } })
    expect(evaluateSimpleExpression('props.title', context)).toBe('Hi')
  })

  it('returns undefined for a missing property', () => {
    expect(evaluateSimpleExpression('props.missing', ctx())).toBeUndefined()
  })

  it('returns undefined once the path walks off a non-object', () => {
    const context = ctx({ props: { title: 'Hi' } })
    expect(
      evaluateSimpleExpression('props.title.nope', context)
    ).toBeUndefined()
  })

  it('returns undefined for a path into an array', () => {
    const context = ctx({ props: { list: [1, 2] } })
    expect(evaluateSimpleExpression('props.list.length', context)).toBeUndefined()
  })
})

describe('negation', () => {
  it('negates a truthy property', () => {
    const context = ctx({ props: { flag: true } })
    expect(evaluateSimpleExpression('props.!flag', context)).toBe(false)
  })

  it('negates a falsy property', () => {
    const context = ctx({ props: { flag: false } })
    expect(evaluateSimpleExpression('props.!flag', context)).toBe(true)
  })

  it('negates the current value when it is not an object', () => {
    const context = ctx({ props: { title: 'Hi' } })
    expect(evaluateSimpleExpression('props.title.!x', context)).toBe(false)
  })
})

describe('ternary', () => {
  // A ternary's branches are resolved fresh from the root context (not
  // from wherever the outer path had reached), and the whole ternary
  // must be its own dot-free segment -- the containing expression is
  // split on '.' *before* '?'/':' are ever looked at, so a branch like
  // "props.yes" would itself be chopped into separate segments first.
  it('takes the true branch', () => {
    const context = ctx({ flag: true, yes: 'Y', no: 'N' })
    expect(evaluateSimpleExpression('flag?yes:no', context)).toBe('Y')
  })

  it('takes the false branch', () => {
    const context = ctx({ flag: false, yes: 'Y', no: 'N' })
    expect(evaluateSimpleExpression('flag?yes:no', context)).toBe('N')
  })

  it.each(['flag?', 'flag?yes'])(
    'falls back to the accumulator for a malformed ternary %s',
    part => {
      const context = ctx({ flag: true })
      expect(evaluateSimpleExpression(part, context)).toEqual(context)
    }
  )

  it('falls back to the accumulator on a leading malformed ternary', () => {
    const context = ctx({ flag: true })
    expect(evaluateSimpleExpression('?yes:no', context)).toEqual(context)
  })
})
