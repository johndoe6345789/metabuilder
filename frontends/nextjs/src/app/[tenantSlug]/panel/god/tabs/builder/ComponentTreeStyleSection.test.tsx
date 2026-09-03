import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../styles/use-css-classes', () => ({
  useCssClasses: () => ({
    classes: [{ id: 'c1', name: 'hero', props: {} }],
    hydrate: vi.fn(),
  }),
}))

import { ComponentTreeStyleSection } from './ComponentTreeStyleSection'
import type { TreeNode } from '@/components/blocks/block-types'

const node = (props: Record<string, unknown> = {}): TreeNode => ({
  id: 'n1',
  type: 'html.button',
  props,
  children: [],
})

describe('ComponentTreeStyleSection', () => {
  it('is always visible, not tucked behind a toggle', () => {
    render(
      <ComponentTreeStyleSection
        node={node()}
        tenant="acme"
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('Style')).toBeTruthy()
    expect(screen.getByText('hero')).toBeTruthy()
  })

  it('forwards a class toggle as a className patch', () => {
    const onChange = vi.fn()
    render(
      <ComponentTreeStyleSection
        node={node()}
        tenant="acme"
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByText('hero'))
    expect(onChange).toHaveBeenCalledWith({ className: 'hero' })
  })
})
