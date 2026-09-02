import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
})
