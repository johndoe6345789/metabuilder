import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const inputValue = (el: HTMLElement) => (el as HTMLInputElement).value

vi.mock('../config/use-dropdown-configs', () => ({
  useDropdownConfigs: () => ({ configs: [] }),
}))

import { ComponentTreePrimaryField } from './ComponentTreePrimaryField'
import type { TreeNode } from './builder-registry'

const node = (type: string, props: Record<string, unknown>): TreeNode => ({
  id: 'n1',
  type,
  props,
  children: [],
})

describe('ComponentTreePrimaryField', () => {
  it('shows the type\'s one primary field', () => {
    render(
      <ComponentTreePrimaryField
        node={node('html.h1', { text: 'Community Darkroom' })}
        onChange={vi.fn()}
      />
    )
    expect(inputValue(screen.getByLabelText('Heading text'))).toBe(
      'Community Darkroom'
    )
  })

  it('shows a button\'s label, not its href or style', () => {
    render(
      <ComponentTreePrimaryField
        node={node('button', { label: 'Join now', href: '/join' })}
        onChange={vi.fn()}
      />
    )
    expect(inputValue(screen.getByLabelText('Button text'))).toBe('Join now')
    expect(screen.queryByLabelText('Goes to')).toBeNull()
  })

  it('shows a list item\'s title, not its icon field', () => {
    render(
      <ComponentTreePrimaryField
        node={node('list-item', { icon: 'star', title: 'Darkroom access' })}
        onChange={vi.fn()}
      />
    )
    expect(inputValue(screen.getByLabelText('Title'))).toBe('Darkroom access')
  })

  it('renders nothing for a type with no primary field', () => {
    const { container } = render(
      <ComponentTreePrimaryField node={node('grid', {})} onChange={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('forwards an edit', () => {
    const onChange = vi.fn()
    render(
      <ComponentTreePrimaryField
        node={node('html.p', { text: 'Old' })}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByLabelText('Text'), {
      target: { value: 'New' },
    })
    expect(onChange).toHaveBeenCalledWith({ text: 'New' })
  })
})
