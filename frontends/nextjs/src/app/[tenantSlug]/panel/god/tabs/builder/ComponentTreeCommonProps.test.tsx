import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../styles/use-css-classes', () => ({
  useCssClasses: () => ({ classes: [], hydrate: vi.fn() }),
}))

import { ComponentTreeCommonProps } from './ComponentTreeCommonProps'
import type { TreeNode } from '@/components/blocks/block-types'

const node = (props: Record<string, unknown> = {}): TreeNode => ({
  id: 'n1',
  type: 'html.button',
  props,
  children: [],
})

describe('ComponentTreeCommonProps', () => {
  it('opens the Accessibility section by default', () => {
    render(
      <ComponentTreeCommonProps
        node={node()}
        tenant="acme"
        duplicateId={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Label (aria-label)')).toBeDefined()
  })

  it('reports a duplicate id as an error', () => {
    render(
      <ComponentTreeCommonProps
        node={node({ id: 'x' })}
        tenant="acme"
        duplicateId
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Identity'))
    expect(screen.getByText('Already used in this tree')).toBeDefined()
  })

  it('switches sections on click, collapsing the previous one', () => {
    render(
      <ComponentTreeCommonProps
        node={node()}
        tenant="acme"
        duplicateId={false}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Identity'))
    expect(screen.getByLabelText('ID')).toBeDefined()
    expect(screen.queryByLabelText('Label (aria-label)')).toBeNull()
  })

  it('forwards an identity field edit', () => {
    const onChange = vi.fn()
    render(
      <ComponentTreeCommonProps
        node={node()}
        tenant="acme"
        duplicateId={false}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByText('Identity'))
    fireEvent.change(screen.getByLabelText('ID'), {
      target: { value: 'hero' },
    })
    expect(onChange).toHaveBeenCalledWith({ id: 'hero' })
  })
})
