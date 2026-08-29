import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useComponentTreeActions } from './component-tree-actions'
import { findNode, parentOf } from './component-tree-utils'
import type { TreeNode } from './builder-registry'

const n = (id: string, type: string, children: TreeNode[] = []): TreeNode => ({
  id,
  type,
  props: {},
  children,
})

/**
 *   root (section, container)
 *   ├── box  (section, container)
 *   │   └── p1 (paragraph, leaf)
 *   └── p2   (paragraph, leaf)
 */
const tree = () =>
  n('root', 'html.section', [
    n('box', 'html.section', [n('p1', 'html.p')]),
    n('p2', 'html.p'),
  ])

function setup(current: TreeNode = tree(), selectedId = 'root') {
  const commit = vi.fn()
  const setSelectedId = vi.fn()
  const selected = findNode(current, selectedId) ?? current
  const hook = renderHook(() =>
    useComponentTreeActions(current, selected, commit, setSelectedId)
  )
  return { ...hook, commit, setSelectedId }
}

/** The tree the hook last asked to be committed. */
const committed = (commit: ReturnType<typeof vi.fn>): TreeNode =>
  commit.mock.calls.at(-1)?.[0] as TreeNode

const childIds = (root: TreeNode, id: string) =>
  findNode(root, id)?.children.map(c => c.id)

describe('useComponentTreeActions', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('addNode', () => {
    it('adds into the selection when it can hold children', () => {
      const { result, commit } = setup(tree(), 'box')

      act(() => result.current.addNode('html.p'))

      expect(childIds(committed(commit), 'box')).toHaveLength(2)
    })

    it('adds at the root when the selection cannot hold children', () => {
      const { result, commit } = setup(tree(), 'p2')

      act(() => result.current.addNode('html.p'))

      expect(childIds(committed(commit), 'root')).toHaveLength(3)
    })

    it('drops into the named container when one is given', () => {
      const { result, commit } = setup()

      act(() => result.current.addNode('html.p', 'box'))

      expect(childIds(committed(commit), 'box')).toHaveLength(2)
    })

    it('drops beside a leaf rather than inside it', () => {
      // Dropping "on" a paragraph visually means next to it.
      const { result, commit } = setup()

      act(() => result.current.addNode('html.p', 'p1'))

      expect(childIds(committed(commit), 'box')).toHaveLength(2)
    })

    it('selects what it just added', () => {
      const { result, setSelectedId } = setup()

      act(() => result.current.addNode('html.p'))

      expect(setSelectedId).toHaveBeenCalledOnce()
    })

    it('ignores a type the palette does not know', () => {
      const { result, commit } = setup()

      act(() => result.current.addNode('not.a.block'))

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('updateProps', () => {
    it('merges the patch into the node props', () => {
      const { result, commit } = setup()

      act(() => result.current.updateProps('p2', { id: 'intro' }))

      expect(findNode(committed(commit), 'p2')?.props.id).toBe('intro')
    })

    it('removes a key set to undefined rather than storing undefined', () => {
      // Storing it would write out an empty string, and the property could
      // never return to its default.
      const withProp = n('root', 'html.section', [
        { ...n('p2', 'html.p'), props: { id: 'intro' } },
      ])
      const { result, commit } = setup(withProp)

      act(() => result.current.updateProps('p2', { id: undefined }))

      expect(
        Object.hasOwn(findNode(committed(commit), 'p2')?.props ?? {}, 'id')
      ).toBe(false)
    })

    it('leaves other nodes alone', () => {
      const { result, commit } = setup()

      act(() => result.current.updateProps('p2', { id: 'x' }))

      expect(findNode(committed(commit), 'p1')?.props).toEqual({})
    })
  })

  describe('deleteNode', () => {
    it('removes the node and reselects the root', () => {
      const { result, commit, setSelectedId } = setup()

      act(() => result.current.deleteNode('p2'))

      expect(findNode(committed(commit), 'p2')).toBeNull()
      expect(setSelectedId).toHaveBeenCalledWith('root')
    })

    it('refuses to delete the root', () => {
      const { result, commit } = setup()

      act(() => result.current.deleteNode('root'))

      expect(commit).not.toHaveBeenCalled()
    })
  })

  describe('moveNode', () => {
    it('nests into a container on an into-drop', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('p2', 'box', 'into'))

      expect(childIds(committed(commit), 'box')).toEqual(['p1', 'p2'])
    })

    it('lands beside a leaf on an into-drop', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('p2', 'p1', 'into'))

      expect(childIds(committed(commit), 'box')).toEqual(['p1', 'p2'])
    })

    it('reorders before a sibling', () => {
      const withTwo = n('root', 'html.section', [
        n('a', 'html.p'),
        n('b', 'html.p'),
      ])
      const { result, commit } = setup(withTwo)

      act(() => result.current.moveNode('b', 'a', 'before'))

      expect(childIds(committed(commit), 'root')).toEqual(['b', 'a'])
    })

    it('reorders after a sibling', () => {
      const withTwo = n('root', 'html.section', [
        n('a', 'html.p'),
        n('b', 'html.p'),
      ])
      const { result, commit } = setup(withTwo)

      act(() => result.current.moveNode('a', 'b', 'after'))

      expect(childIds(committed(commit), 'root')).toEqual(['b', 'a'])
    })

    it('refuses to move the root', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('root', 'box'))

      expect(commit).not.toHaveBeenCalled()
    })

    it('refuses to drop a node onto itself', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('box', 'box'))

      expect(commit).not.toHaveBeenCalled()
    })

    it('refuses to drop a node inside its own descendant', () => {
      // This would detach the subtree from the tree entirely.
      const { result, commit } = setup()

      act(() => result.current.moveNode('box', 'p1'))

      expect(commit).not.toHaveBeenCalled()
    })

    it('ignores a drag id that is not in the tree', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('ghost', 'box'))

      expect(commit).not.toHaveBeenCalled()
    })

    it('ignores a target that is not in the tree', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('p2', 'ghost'))

      expect(commit).not.toHaveBeenCalled()
    })

    it('does not leave a copy behind when moving', () => {
      const { result, commit } = setup()

      act(() => result.current.moveNode('p2', 'box', 'into'))

      expect(parentOf(committed(commit), 'p2')?.id).toBe('box')
      expect(childIds(committed(commit), 'root')).toEqual(['box'])
    })
  })
})
