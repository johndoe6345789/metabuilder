import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { VaultNode } from './VaultNode'
import type { Context } from './vault-context'

// The dynamic/stateful components -- Notice reads controller state rather
// than node props, Repeat fans out over a source array, and an unregistered
// component name is a no-op rather than an error. Split out of
// VaultNode.test.tsx (which covers plain static rendering) to stay under
// the 80-line file limit.

const context: Context = {
  vault: { notice: null } as never,
  view: {} as never,
}

describe('VaultNode special components', () => {
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
          vault: {
            notice: { kind: 'error', message: 'Wrong password' },
          } as never,
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
      <VaultNode
        node={{ component: 'NotARealThing' } as never}
        context={context}
      />
    )
    expect(container.innerHTML).toBe('')
  })
})
