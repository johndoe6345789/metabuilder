import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { TreeNode } from '../builder-registry'
import { AddBlockDialog } from './AddBlockDialog'

const tree: TreeNode = {
  id: 'root',
  type: 'container',
  props: {},
  children: [{ id: 'hero', type: 'html.section', props: {}, children: [] }],
}

const baseProps = {
  tree,
  defaultTargetId: 'root',
  onClose: vi.fn(),
  onConfirm: vi.fn(),
}

describe('AddBlockDialog', () => {
  it('renders nothing when closed', () => {
    render(<AddBlockDialog {...baseProps} open={false} pendingType="grid" />)
    expect(screen.queryByText('Add Grid')).toBeNull()
  })

  it('titles itself after the block being placed', () => {
    render(<AddBlockDialog {...baseProps} open pendingType="grid" />)
    expect(screen.getByText('Add Grid')).toBeTruthy()
  })

  it('shows the tree to choose a destination from', () => {
    render(<AddBlockDialog {...baseProps} open pendingType="grid" />)
    expect(screen.getByText('Container')).toBeTruthy()
    expect(screen.getByText('Section')).toBeTruthy()
  })

  it('confirms at the default target when nothing else is picked', () => {
    const onConfirm = vi.fn()
    render(
      <AddBlockDialog
        {...baseProps}
        onConfirm={onConfirm}
        open
        pendingType="grid"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add here' }))
    expect(onConfirm).toHaveBeenCalledWith('root')
  })

  it('confirms at whichever node was picked', () => {
    const onConfirm = vi.fn()
    render(
      <AddBlockDialog
        {...baseProps}
        onConfirm={onConfirm}
        open
        pendingType="grid"
      />
    )
    fireEvent.click(screen.getByText('Section'))
    fireEvent.click(screen.getByRole('button', { name: 'Add here' }))
    expect(onConfirm).toHaveBeenCalledWith('hero')
  })

  it('closes without confirming on Cancel', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    render(
      <AddBlockDialog
        {...baseProps}
        onClose={onClose}
        onConfirm={onConfirm}
        open
        pendingType="grid"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
