import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MiddlePanes } from './MiddlePanes'
import type { TreeNode } from '../builder-registry'
import type { useComponentTree } from '../use-component-tree'

vi.mock('../../styles/use-css-classes', () => ({
  useCssClasses: () => ({ classes: [], hydrate: vi.fn() }),
}))

vi.mock('../../config/use-dropdown-configs', () => ({
  useDropdownConfigs: () => ({ configs: [] }),
}))

const node = (
  id: string,
  type: string,
  props: Record<string, unknown> = {}
): TreeNode => ({
  id,
  type,
  props,
  children: [],
})

function fakeTree(selected: TreeNode): ReturnType<typeof useComponentTree> {
  return {
    tree: node('root', 'html.section', {}),
    selected,
    selectedId: selected.id,
    setSelectedId: vi.fn(),
    addNode: vi.fn(),
    updateProps: vi.fn(),
    deleteNode: vi.fn(),
    moveNode: vi.fn(),
    resetTree: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
    dirty: false,
    publish: vi.fn(),
    publishing: false,
    conflict: null,
    load: vi.fn(),
    loading: false,
  } as unknown as ReturnType<typeof useComponentTree>
}

describe('MiddlePanes', () => {
  it('names the selected element in the Properties pane title, not its raw type', () => {
    render(
      <MiddlePanes
        t={fakeTree(node('h1', 'html.h1', { text: 'Community Darkroom' }))}
        tenant="acme"
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        duplicateId={false}
      />
    )
    expect(screen.getByText('Heading 1')).toBeTruthy()
    expect(screen.queryByText('html.h1')).toBeNull()
  })

  it('updates the title when a different node is selected', () => {
    render(
      <MiddlePanes
        t={fakeTree(node('p1', 'html.p', { text: 'Paragraph text.' }))}
        tenant="acme"
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        duplicateId={false}
      />
    )
    expect(screen.getByText('Paragraph')).toBeTruthy()
  })
})
