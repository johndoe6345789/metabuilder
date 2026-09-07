import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// The click field's options come from a live fetch of the tenant's
// workflows; these tests are about the declared fields, not that list.
vi.mock('./use-workflow-names', () => ({ useWorkflowNames: () => [] }))
vi.mock('../config/use-dropdown-configs', () => ({
  useDropdownConfigs: () => ({ configs: [] }),
}))

import { ComponentTreeAutoProps } from './ComponentTreeAutoProps'
import type { TreeNode } from './builder-registry'

const node = (props: Record<string, unknown>): TreeNode => ({
  id: 'n1',
  type: 'image',
  props,
  children: [],
})

describe('ComponentTreeAutoProps', () => {
  it('warns that an image with a picture but no description will be skipped', () => {
    render(
      <ComponentTreeAutoProps
        node={node({ src: 'https://example.com/photo.jpg', alt: '' })}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText(/screen readers will skip it/)).toBeTruthy()
  })

  it('does not warn about a description when there is no image yet', () => {
    render(
      <ComponentTreeAutoProps
        node={node({ src: '', alt: '' })}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/screen readers will skip it/)).toBeNull()
  })

  it('does not warn once a description has been written', () => {
    render(
      <ComponentTreeAutoProps
        node={node({ src: 'https://example.com/photo.jpg', alt: 'A red bicycle' })}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByText(/screen readers will skip it/)).toBeNull()
  })

  it('omits a field already shown as the primary field elsewhere', () => {
    render(
      <ComponentTreeAutoProps
        node={node({ src: 'https://example.com/photo.jpg', alt: '' })}
        onChange={vi.fn()}
        excludeField="src"
      />
    )
    expect(screen.queryByLabelText('Image address')).toBeNull()
    expect(screen.getByLabelText('Description')).toBeTruthy()
  })

  /**
   * Was "renders nothing": a heading declared only its text, so excluding
   * the primary field left an empty panel. Every block now also carries
   * the click field, so what is left is that and nothing else -- the
   * exclusion still being the thing under test.
   */
  it('leaves only the click field when the primary one is excluded', () => {
    const heading = (props: Record<string, unknown>): TreeNode => ({
      id: 'n1',
      type: 'html.h1',
      props,
      children: [],
    })
    const { container } = render(
      <ComponentTreeAutoProps
        node={heading({ text: 'Hello' })}
        onChange={vi.fn()}
        excludeField="text"
      />
    )
    expect(screen.queryByLabelText('Text')).toBeNull()
    expect(screen.getByLabelText('When clicked, run')).toBeTruthy()
    expect(container.querySelectorAll('input')).toHaveLength(1)
  })
})
