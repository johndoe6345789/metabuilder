import { describe, expect, it } from 'vitest'

import { evaluateExpression } from './evaluate-expression'
import type { RenderContext } from '../render-json-component'

const ctx = (over: Partial<RenderContext> = {}): RenderContext => ({
  props: {},
  state: {},
  ...over,
})

describe('evaluateExpression', () => {
  it('returns a non-string value unchanged', () => {
    expect(evaluateExpression(42, ctx())).toBe(42)
  })

  it('returns plain text unchanged (not template syntax)', () => {
    expect(evaluateExpression('hello', ctx())).toBe('hello')
  })

  it('resolves a {{props.x}} template expression', () => {
    const context = ctx({ props: { title: 'Hi' } })
    expect(evaluateExpression('{{props.title}}', context)).toBe('Hi')
  })

  it('returns the literal string when over the ReDoS length guard', () => {
    const long = `{{${'a'.repeat(1001)}}}`
    expect(evaluateExpression(long, ctx())).toBe(long)
  })

  it('returns an empty {{}} expression unchanged', () => {
    expect(evaluateExpression('{{}}', ctx())).toBe('{{}}')
  })

  it('resolves a missing property to undefined rather than throwing', () => {
    expect(evaluateExpression('{{props.missing}}', ctx())).toBeUndefined()
  })

  it('falls back to the original string when evaluation throws', () => {
    const throwing = ctx({
      props: new Proxy(
        {},
        {
          get() {
            throw new Error('boom')
          },
        }
      ),
    })
    expect(evaluateExpression('{{props.title}}', throwing)).toBe(
      '{{props.title}}'
    )
  })
})
