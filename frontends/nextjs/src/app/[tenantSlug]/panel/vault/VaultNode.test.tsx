import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { VaultNode } from './VaultNode'
import type { Context } from './vault-context'

const context: Context = {
  vault: { notice: null } as never,
  view: {} as never,
}

describe('VaultNode', () => {
  it('renders nothing when its condition is false', () => {
    const { container } = render(
      <VaultNode
        node={{ component: 'div', when: false } as never}
        context={context}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders a native element with its text', () => {
    render(
      <VaultNode node={{ component: 'strong', text: 'Hello' } as never} context={context} />
    )
    expect(screen.getByText('Hello')).toBeTruthy()
  })

  it('renders children of a native element', () => {
    render(
      <VaultNode
        node={{
          component: 'div',
          children: [{ component: 'span', text: 'child' }],
        } as never}
        context={context}
      />
    )
    expect(screen.getByText('child')).toBeTruthy()
  })

  it('renders a registered M3 primitive', () => {
    render(
      <VaultNode node={{ component: 'Typography', text: 'Title' } as never} context={context} />
    )
    expect(screen.getByText('Title')).toBeTruthy()
  })

  it('renders a named layout component', () => {
    const { container } = render(
      <VaultNode
        node={{ component: 'Page', children: [{ component: 'span', text: 'x' }] } as never}
        context={context}
      />
    )
    expect(container.textContent).toBe('x')
  })

  // Notice reads the controller's own state rather than the node's props --
  // nothing renders until there is a real notice to show.
  it('renders nothing for Notice when there is no notice', () => {
    const { container } = render(
      <VaultNode node={{ component: 'Notice' } as never} context={context} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders the notice message once there is one', () => {
    render(
      <VaultNode
        node={{ component: 'Notice' } as never}
        context={{
          ...context,
          vault: { notice: { kind: 'error', message: 'Wrong password' } } as never,
        }}
      />
    )
    expect(screen.getByText('Wrong password')).toBeTruthy()
  })

  it('repeats over its source, once per item', () => {
    render(
      <VaultNode
        node={{
          component: 'Repeat',
          source: { $path: 'items' },
          item: 'entry',
          children: [{ component: 'span', text: { $path: 'entry' } }],
        } as never}
        context={{ ...context, items: ['a', 'b'] }}
      />
    )
    expect(screen.getByText('a')).toBeTruthy()
    expect(screen.getByText('b')).toBeTruthy()
  })

  it('is unknown to nothing -- an unregistered component renders nothing', () => {
    const { container } = render(
      <VaultNode node={{ component: 'NotARealThing' } as never} context={context} />
    )
    expect(container.innerHTML).toBe('')
  })
})
