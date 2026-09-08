import { describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import type { ReactNode } from 'react'

import { PALETTE, renderNode } from './block-registry'
import { store } from '@/store/store'
import {
  AuthProviderComponent,
} from '@/app/_components/auth-provider/auth-provider-component'

// The self-hosting blocks read the route to know whose tenant they are
// showing. Which tenant is not what this file is about; that they forward
// what they were given is.
vi.mock('next/navigation', () => ({
  useParams: () => ({ tenantSlug: 'acme' }),
  usePathname: () => '/acme',
}))

const CLASS = 'sweep-cls'
const ID = 'sweep-id'

// The self-hosting blocks reach for the store and the signed-in user; the
// rest ignore both.
const Providers = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <AuthProviderComponent>{children}</AuthProviderComponent>
  </Provider>
)

/**
 * Every block in the palette, not a hand-picked few.
 *
 * renderNode applies the author's attributes with cloneElement, which lands
 * them on whatever the block's render() returned. That works for the blocks
 * returning a plain element and silently does nothing for the ones returning
 * a component, because a component drops the props it does not name -- so
 * seven blocks took a class in the builder and put it on no DOM node at all.
 * Nothing about a block's definition says which kind it is, and the failure
 * is invisible: the block still renders, just unstyled.
 *
 * So the palette is swept rather than sampled. A block added later that
 * forwards nothing fails here on the day it is added.
 *
 * Exactly one node, not at least one: a class on a wrapper as well as on the
 * control would be matched twice by a workflow's page.class selector, and the
 * effect applied to both.
 */
describe('every palette block carries the attributes it was given', () => {
  it.each(PALETTE.map(p => [p.type]))(
    '%s puts the id and class on exactly one node',
    async type => {
      const { container } = render(
        <Providers>
          {renderNode({
            id: 'n1',
            type,
            // The image block renders nothing at all without an address --
            // deliberately, so a forgotten src is not a notice shipped to
            // visitors -- which leaves it no node to carry attributes on.
            // Every other block renders something with empty props.
            props: {
              className: CLASS,
              id: ID,
              ...(type === 'image' ? { src: 'https://x/y.png', alt: 'y' } : {}),
            },
            children: [],
          })}
        </Providers>
      )

      // The heavy blocks are lazy, so they show a placeholder for a tick
      // before the component that carries anything exists.
      await waitFor(() => {
        expect(container.querySelectorAll(`.${CLASS}`)).toHaveLength(1)
      })
      expect(container.querySelectorAll(`#${ID}`)).toHaveLength(1)
    }
  )
})
