import { describe, expect, it } from 'vitest'

import { buildComponentProps } from './component-props'
import type { RenderContext } from '../render-json-component'

const ctx: RenderContext = { props: { name: 'Ada' }, state: {} }

describe('buildComponentProps', () => {
  it('evaluates every declared prop', () => {
    const result = buildComponentProps(
      { props: { label: '{{props.name}}' } },
      ctx
    )
    expect(result).toEqual({ label: 'Ada' })
  })

  it('drops a prop that evaluates to undefined', () => {
    const result = buildComponentProps(
      { props: { label: '{{props.missing}}' } },
      ctx
    )
    expect(result).toEqual({})
  })

  it('returns an empty object with no declared props', () => {
    expect(buildComponentProps({}, ctx)).toEqual({})
  })

  it('returns an empty object when props is not an object', () => {
    expect(buildComponentProps({ props: 'oops' }, ctx)).toEqual({})
  })

  it('returns an empty object when props is an array', () => {
    expect(buildComponentProps({ props: [1, 2] }, ctx)).toEqual({})
  })

  it('passes through a non-template literal value unchanged', () => {
    const result = buildComponentProps({ props: { count: 3 } }, ctx)
    expect(result).toEqual({ count: 3 })
  })
})
