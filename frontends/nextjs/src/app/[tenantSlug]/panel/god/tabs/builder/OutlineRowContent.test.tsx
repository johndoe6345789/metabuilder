import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { OutlineRowContent } from './OutlineRowContent'
import type { TreeNode } from './builder-registry'

const node = (id: string, type = 'html.p'): TreeNode => ({
  id,
  type,
  props: {},
  children: [],
})

const baseProps = {
  isCollapsed: false,
  draggable: true,
  onToggleCollapse: vi.fn(),
  onDragStart: vi.fn(),
}

describe('OutlineRowContent', () => {
  it('wires the delete button to the node it belongs to', () => {
    const onDelete = vi.fn()
    render(
      <OutlineRowContent
        {...baseProps}
        node={node('p2')}
        hasChildren={false}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByText('✕'))

    expect(onDelete).toHaveBeenCalledWith('p2')
  })

  it('hides the delete button for the root node', () => {
    render(
      <OutlineRowContent
        {...baseProps}
        node={node('root')}
        hasChildren={false}
        onDelete={vi.fn()}
      />
    )

    expect(screen.queryByText('✕')).toBeNull()
  })

  it('makes only the grip draggable, not the whole row', () => {
    render(
      <OutlineRowContent
        {...baseProps}
        node={node('p2')}
        hasChildren={false}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('⠿')).toHaveProperty('draggable', true)
  })

  it('is not draggable when the caller says so (the root row)', () => {
    render(
      <OutlineRowContent
        {...baseProps}
        node={node('root')}
        hasChildren={false}
        draggable={false}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('⠿')).toHaveProperty('draggable', false)
  })

  it('starts a drag from the grip', () => {
    const onDragStart = vi.fn()
    render(
      <OutlineRowContent
        {...baseProps}
        node={node('p2')}
        hasChildren={false}
        onDragStart={onDragStart}
        onDelete={vi.fn()}
      />
    )

    fireEvent.dragStart(screen.getByText('⠿'))

    expect(onDragStart).toHaveBeenCalledOnce()
  })
})
