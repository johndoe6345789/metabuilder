import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../config/use-dropdown-configs', () => ({
  useDropdownConfigs: () => ({ configs: [] }),
}))

import { ComponentTreeMoreOptions } from './ComponentTreeMoreOptions'
import type { TreeNode } from './builder-registry'

const node = (type: string, props: Record<string, unknown> = {}): TreeNode => ({
  id: 'n1',
  type,
  props,
  children: [],
})

describe('ComponentTreeMoreOptions', () => {
  it('is collapsed by default', () => {
    render(
      <ComponentTreeMoreOptions
        node={node('button', { label: 'Join now' })}
        duplicateId={false}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('More options')).toBeTruthy()
    expect(screen.queryByLabelText('ID')).toBeNull()
  })

  it('opens to show identity, accessibility, and the block\'s other fields', () => {
    render(
      <ComponentTreeMoreOptions
        node={node('button', { label: 'Join now', href: '/join' })}
        duplicateId={false}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('More options'))
    expect(screen.getByLabelText('ID')).toBeTruthy()
    expect(screen.getByLabelText('Label (aria-label)')).toBeTruthy()
    expect(screen.getByLabelText('Goes to')).toBeTruthy()
  })

  it('does not repeat the primary field', () => {
    render(
      <ComponentTreeMoreOptions
        node={node('button', { label: 'Join now', href: '/join' })}
        duplicateId={false}
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('More options'))
    expect(screen.queryByLabelText('Button text')).toBeNull()
  })

  it('reports a duplicate id as an error once opened', () => {
    render(
      <ComponentTreeMoreOptions
        node={node('html.p', { text: 'Hi', id: 'x' })}
        duplicateId
        onChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('More options'))
    expect(screen.getByText('Already used in this tree')).toBeTruthy()
  })
})
