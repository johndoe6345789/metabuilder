import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import type { TreeNode } from './builder-registry'

const root = (): TreeNode => ({
  id: 'root',
  type: 'container',
  props: {},
  children: [],
})

/** A store that actually holds the tree, so undo/redo can be exercised. */
const store = vi.hoisted(() => ({ tree: null as unknown, dirty: false }))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'setTree') store.tree = action.payload
  },
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { tree: store.tree, dirty: { tree: store.dirty } } }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    setTree: (p: unknown) => ({ type: 'setTree', payload: p }),
    clearDirty: (p: unknown) => ({ type: 'clearDirty', payload: p }),
  }
})
vi.mock('./component-tree-publish', () => ({
  useComponentTreePublish: () => ({
    publish: vi.fn(),
    publishing: false,
    conflict: null,
    load: vi.fn(async () => true),
    loading: false,
  }),
}))

import { useComponentTree } from './use-component-tree'

/**
 * Renders the hook and re-reads it after each dispatch. commit() is
 * internal, so history is driven through a real edit action -- which is
 * also the point: every action is meant to record itself automatically.
 */
function setup() {
  const hook = renderHook(() => useComponentTree())
  const edit = (marker: string) => {
    act(() => hook.result.current.updateProps('root', { marker }))
    hook.rerender()
  }
  return { ...hook, edit }
}

const markerOf = (tree: TreeNode): unknown => tree.props.marker

describe('useComponentTree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.tree = root()
    store.dirty = false
  })

  describe('selection', () => {
    it('starts at the root', () => {
      expect(setup().result.current.selectedId).toBe('root')
    })

    it('changes to whatever is selected', () => {
      const { result, rerender } = setup()

      act(() => result.current.setSelectedId('other'))
      rerender()

      expect(result.current.selectedId).toBe('other')
    })
  })

  describe('history', () => {
    it('has nothing to undo before any edit', () => {
      const { result } = setup()

      expect(result.current.canUndo).toBe(false)
      expect(result.current.canRedo).toBe(false)
    })

    it('can undo after an edit', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      rerender()

      expect(result.current.canUndo).toBe(true)
    })

    it('restores the previous tree on undo', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      act(() => result.current.undo())
      rerender()

      expect(markerOf(result.current.tree)).toBeUndefined()
    })

    it('can redo what it just undid', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      act(() => result.current.undo())
      rerender()

      expect(result.current.canRedo).toBe(true)

      act(() => result.current.redo())
      rerender()

      expect(markerOf(result.current.tree)).toBe('v1')
    })

    it('walks back through several edits in order', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      edit('v2')

      act(() => result.current.undo())
      rerender()
      expect(markerOf(result.current.tree)).toBe('v1')

      act(() => result.current.undo())
      rerender()
      expect(markerOf(result.current.tree)).toBeUndefined()
    })

    it('discards the redo branch once a new edit is made', () => {
      // Redoing into a future that no longer follows from the present
      // would silently resurrect discarded work.
      const { result, edit, rerender } = setup()

      edit('v1')
      act(() => result.current.undo())
      rerender()
      edit('v2')
      rerender()

      expect(result.current.canRedo).toBe(false)
    })

    it('does nothing on undo with an empty history', () => {
      const { result, rerender } = setup()

      act(() => result.current.undo())
      rerender()

      expect(markerOf(result.current.tree)).toBeUndefined()
    })

    it('does nothing on redo with nothing ahead', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      act(() => result.current.redo())
      rerender()

      expect(markerOf(result.current.tree)).toBe('v1')
    })

    it('caps the history rather than growing without bound', () => {
      const { result, edit, rerender } = setup()

      for (let i = 0; i < 60; i += 1) edit(`v${i}`)
      rerender()

      // 50 entries deep: undoing more than that stops at the oldest kept.
      let undos = 0
      while (result.current.canUndo && undos < 100) {
        act(() => result.current.undo())
        rerender()
        undos += 1
      }
      expect(undos).toBeLessThanOrEqual(50)
      expect(undos).toBeGreaterThan(0)
    })
  })

  describe('resetTree', () => {
    it('replaces the tree with an empty root', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      act(() => result.current.resetTree())
      rerender()

      expect(markerOf(result.current.tree)).toBeUndefined()
      expect(result.current.tree.children).toEqual([])
    })

    it('is itself undoable', () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      act(() => result.current.resetTree())
      rerender()

      expect(result.current.canUndo).toBe(true)
    })
  })

  describe('load', () => {
    it('starts a fresh history, since the old one is not ours', async () => {
      const { result, edit, rerender } = setup()

      edit('v1')
      rerender()
      expect(result.current.canUndo).toBe(true)

      await act(async () => {
        await result.current.load('system', '/')
      })
      rerender()

      expect(result.current.canUndo).toBe(false)
    })
  })
})
