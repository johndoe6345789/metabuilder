import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import {
  EmptyState,
  LoadingIndicator,
  Skeleton,
} from '@metabuilder/components'

/**
 * These components used to be replaced, at build time, by a shim whose
 * every export was `() => null`.
 *
 * The alias lived in next.config.ts and applied to every build -- not
 * only the standalone Docker build its comment described -- so every
 * skeleton, spinner and empty state in the product rendered nothing at
 * all. Tests never saw it, because vitest resolves the real package. That
 * gap is what let it survive: the suite was green against components the
 * application never actually ran.
 *
 * This file is the tripwire. If the shipped components ever go back to
 * rendering nothing, these fail.
 */
describe('the shared components the app ships', () => {
  it('renders a skeleton, not nothing', () => {
    const { container } = render(<Skeleton />)
    expect(container.innerHTML).not.toBe('')
  })

  it('renders a loading indicator, not nothing', () => {
    const { container } = render(<LoadingIndicator />)
    expect(container.innerHTML).not.toBe('')
  })

  it('renders an empty state carrying its own message', () => {
    const { container } = render(<EmptyState title="Nothing here yet" />)
    expect(container.textContent).toContain('Nothing here yet')
  })
})
