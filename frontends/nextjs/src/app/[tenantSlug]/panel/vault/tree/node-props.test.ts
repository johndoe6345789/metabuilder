import { describe, expect, it } from 'vitest'

import { nodeProps, resolveClassName } from './node-props'

const context = { vault: {} as never, view: {} as never, name: 'Ada' }
const classNames = { card: 'card_abc123' }

describe('nodeProps', () => {
  it('evaluates every declared prop against the context', () => {
    expect(
      nodeProps(
        {
          component: 'div',
          props: { label: { $template: '{{ name }}' } },
        } as never,
        context,
        classNames
      )
    ).toEqual({ label: 'Ada' })
  })

  it('leaves a literal (non-binding) prop value unevaluated', () => {
    expect(
      nodeProps(
        { component: 'div', props: { label: 'literal text' } } as never,
        context,
        classNames
      )
    ).toEqual({ label: 'literal text' })
  })

  it('is empty when the node declares no props', () => {
    expect(nodeProps({ component: 'div' } as never, context, classNames)).toEqual(
      {}
    )
  })

  it('resolves a literal className through the class map', () => {
    expect(
      nodeProps(
        { component: 'div', className: 'card' } as never,
        context,
        classNames
      ).className
    ).toBe('card_abc123')
  })

  // A non-string className is a binding, evaluated against the context --
  // only a bare string is treated as a literal class-map key.
  it('evaluates a templated className binding', () => {
    expect(
      nodeProps(
        {
          component: 'div',
          className: { $template: '{{ name }}' },
        } as never,
        context,
        classNames
      ).className
    ).toBe('Ada')
  })

  it('omits className when the node declares none', () => {
    expect(
      nodeProps({ component: 'div' } as never, context, classNames)
    ).not.toHaveProperty('className')
  })
})

describe('resolveClassName', () => {
  it('looks up a literal name in the class map', () => {
    expect(resolveClassName({ className: 'card' }, context, classNames)).toBe(
      'card_abc123'
    )
  })

  it('evaluates a className binding', () => {
    expect(
      resolveClassName(
        { className: { $template: '{{ name }}' } },
        context,
        classNames
      )
    ).toBe('Ada')
  })

  it('is undefined for a class map entry that does not exist', () => {
    expect(
      resolveClassName({ className: 'missing' }, context, classNames)
    ).toBeUndefined()
  })

  it('is undefined when the node declares no className', () => {
    expect(resolveClassName({}, context, classNames)).toBeUndefined()
  })
})
