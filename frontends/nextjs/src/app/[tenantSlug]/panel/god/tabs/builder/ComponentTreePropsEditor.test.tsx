import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../config/use-dropdown-configs', () => ({
  useDropdownConfigs: () => ({ configs: [] }),
}))
vi.mock('../styles/use-css-classes', () => ({
  useCssClasses: () => ({ classes: [], hydrate: vi.fn() }),
}))

import { ComponentTreePropsEditor } from './ComponentTreePropsEditor'
import type { TreeNode } from './builder-registry'

const node = (type: string, props: Record<string, unknown>): TreeNode => ({
  id: 'n1',
  type,
  props,
  children: [],
})

describe('ComponentTreePropsEditor', () => {
  it('opens on the primary field, with everything else tucked away', () => {
    render(
      <ComponentTreePropsEditor
        node={node('html.h1', { text: 'Community Darkroom' })}
        tenant="acme"
        duplicateId={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Heading text')).toBeTruthy()
    expect(screen.getByText('Style')).toBeTruthy()
    expect(screen.getByText('More options')).toBeTruthy()
    expect(screen.queryByLabelText('ID')).toBeNull()
    expect(screen.queryByLabelText('Label (aria-label)')).toBeNull()
  })
})
