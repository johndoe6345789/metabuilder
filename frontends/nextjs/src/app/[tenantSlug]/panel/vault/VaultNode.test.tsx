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
      <VaultNode
        node={{ component: 'strong', text: 'Hello' } as never}
        context={context}
      />
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
      <VaultNode
        node={{ component: 'Typography', text: 'Title' } as never}
        context={context}
      />
    )
    expect(screen.getByText('Title')).toBeTruthy()
  })

  it('renders a named layout component', () => {
    const { container } = render(
      <VaultNode
        node={{
          component: 'Page',
          children: [{ component: 'span', text: 'x' }],
        } as never}
        context={context}
      />
    )
    expect(container.textContent).toBe('x')
  })
})
