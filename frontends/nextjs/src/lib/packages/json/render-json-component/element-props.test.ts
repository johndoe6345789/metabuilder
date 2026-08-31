import { describe, expect, it } from 'vitest'

import { buildElementProps } from './element-props'
import type { RenderContext } from '../render-json-component'

const ctx: RenderContext = { props: {}, state: {} }

describe('buildElementProps', () => {
  it('passes className through as-is', () => {
    expect(buildElementProps({ className: 'card' }, ctx)).toEqual({
      className: 'card',
    })
  })

  it('passes style through as-is', () => {
    const style = { color: 'red' }
    expect(buildElementProps({ style }, ctx)).toEqual({ style })
  })

  it('evaluates href, src, and alt', () => {
    const context = { props: { url: 'https://x' }, state: {} }
    const props = buildElementProps(
      { href: '{{props.url}}', src: '{{props.url}}', alt: 'pic' },
      context
    )
    expect(props).toEqual({
      href: 'https://x',
      src: 'https://x',
      alt: 'pic',
    })
  })

  it('drops href/src/alt that evaluate to undefined', () => {
    expect(buildElementProps({ href: '{{props.missing}}' }, ctx)).toEqual({})
  })

  it('produces an empty object for a bare node', () => {
    expect(buildElementProps({}, ctx)).toEqual({})
  })
})
