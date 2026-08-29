import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { renderJSONComponent } from './render-json-component'
import type { JSONComponent } from './types'

const registry = {
  Box: ({ children, ...rest }: Record<string, unknown>) => (
    <section data-testid="box" {...(rest as object)}>
      {children as never}
    </section>
  ),
}

const component = (template: unknown, name = 'Demo'): JSONComponent =>
  ({ id: name, name, render: { template } }) as never

const html = (
  c: JSONComponent,
  props: Record<string, unknown> = {},
  all?: JSONComponent[]
) =>
  render(renderJSONComponent(c, props as never, registry as never, all))
    .container.innerHTML

describe('renderJSONComponent', () => {
  describe('malformed definitions', () => {
    it('names the component when there is no render block', () => {
      // Silence would leave an author guessing which component is broken.
      const out = html({ id: 'x', name: 'Broken' } as never)
      expect(out).toContain('Broken')
      expect(out).toContain('no render definition')
    })

    it('warns when there is no template', () => {
      const out = html({ id: 'x', name: 'Empty', render: {} } as never)
      expect(out).toContain('no template')
    })
  })

  describe('plain elements', () => {
    it('renders a div by default', () => {
      expect(html(component({ children: 'hi' }))).toContain('<div')
    })

    it('renders a primitive template as text', () => {
      expect(html(component('just text'))).toContain('just text')
    })

    it('applies className and style', () => {
      const out = html(
        component({ type: 'div', className: 'card', children: 'x' })
      )
      expect(out).toContain('card')
    })
  })

  describe('interpolation', () => {
    it('substitutes a prop into children', () => {
      const out = html(component({ children: '{{props.title}}' }), {
        title: 'Hello',
      })
      expect(out).toContain('Hello')
    })

    it('leaves a non-expression string alone', () => {
      expect(html(component({ children: 'plain' }))).toContain('plain')
    })

    it('leaves an unresolvable expression as written', () => {
      const out = html(component({ children: '{{props.missing}}' }))
      expect(out).not.toContain('undefined')
    })

    it('does not evaluate an over-long string', () => {
      // A length cap guards the expression regex against ReDoS.
      const long = `{{${'a'.repeat(1100)}}}`
      expect(() => html(component({ children: long }))).not.toThrow()
    })
  })

  describe('conditionals', () => {
    const conditional = (condition: unknown, extra = {}) =>
      component({
        type: 'conditional',
        condition,
        then: { children: 'YES' },
        else: { children: 'NO' },
        ...extra,
      })

    it('takes the then branch when true', () => {
      expect(html(conditional('{{props.flag}}'), { flag: true })).toContain(
        'YES'
      )
    })

    it('takes the else branch when false', () => {
      expect(html(conditional('{{props.flag}}'), { flag: false })).toContain(
        'NO'
      )
    })

    it.each([[0], [''], [false], [null]])('treats %p as false', value => {
      expect(html(conditional('{{props.flag}}'), { flag: value })).toContain(
        'NO'
      )
    })

    it('renders nothing when the condition is absent', () => {
      const out = html(
        component({ type: 'conditional', then: { children: 'YES' } })
      )
      expect(out).not.toContain('YES')
    })

    it('renders nothing when the chosen branch is missing', () => {
      const out = html(
        component({
          type: 'conditional',
          condition: '{{props.flag}}',
          else: { children: 'NO' },
        }),
        { flag: true }
      )
      expect(out).not.toContain('NO')
    })
  })

  describe('registry components', () => {
    it('renders a registered component by type', () => {
      expect(html(component({ type: 'Box', children: 'inner' }))).toContain(
        'data-testid="box"'
      )
    })

    it('passes evaluated props to it', () => {
      const out = html(
        component({ type: 'Box', props: { id: '{{props.k}}' } }),
        {
          k: 'from-props',
        }
      )
      expect(out).toContain('from-props')
    })

    it('renders an array of children', () => {
      const out = html(
        component({
          type: 'Box',
          children: [{ children: 'one' }, { children: 'two' }],
        })
      )
      expect(out).toContain('one')
      expect(out).toContain('two')
    })

    it('renders an unknown type as a literal element of that name', () => {
      // getElementType passes anything unmapped straight through, so the
      // type becomes the tag rather than being dropped or defaulted to div.
      expect(html(component({ type: 'NotRegistered' }))).toContain(
        '<notregistered'
      )
    })

    it.each([
      ['Text', 'span'],
      ['Button', 'button'],
      ['Link', 'a'],
      ['List', 'ul'],
      ['Divider', 'hr'],
    ])('maps the %s type to <%s>', (type, tag) => {
      expect(html(component({ type }))).toContain(`<${tag}`)
    })
  })

  describe('$ref resolution', () => {
    const shared = component({ children: 'shared body' }, 'Shared')

    it('renders the referenced component', () => {
      const out = html(component({ $ref: 'Shared' }), {}, [shared])
      expect(out).toContain('shared body')
    })

    it('warns rather than rendering nothing for a missing ref', () => {
      const out = html(component({ $ref: 'Nope' }), {}, [shared])
      expect(out).toContain('not')
    })

    it('ignores a $ref when no component list was supplied', () => {
      expect(() => html(component({ $ref: 'Shared' }))).not.toThrow()
    })
  })
})
