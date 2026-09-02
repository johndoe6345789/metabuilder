import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RowTwisty } from './RowTwisty'

describe('RowTwisty', () => {
  it('toggles collapse when the node has children', () => {
    const onToggleCollapse = vi.fn()
    render(
      <RowTwisty
        id="box"
        hasChildren
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
      />
    )

    fireEvent.click(screen.getByLabelText('Collapse'))

    expect(onToggleCollapse).toHaveBeenCalledWith('box')
  })

  it('does nothing on a leaf, which has no children to toggle', () => {
    const onToggleCollapse = vi.fn()
    render(
      <RowTwisty
        id="p2"
        hasChildren={false}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
      />
    )

    fireEvent.click(screen.getByLabelText('Collapse'))

    expect(onToggleCollapse).not.toHaveBeenCalled()
  })

  it('labels itself Expand when collapsed', () => {
    render(
      <RowTwisty
        id="box"
        hasChildren
        isCollapsed
        onToggleCollapse={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Expand')).toBeTruthy()
  })
})
