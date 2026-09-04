import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const componentTree = vi.hoisted(() => ({
  useComponentTree: vi.fn(() => ({
    tree: { id: 'root', type: 'root', props: {}, children: [] },
    selected: { id: 'root', type: 'root', props: {}, children: [] },
    undo: vi.fn(),
    redo: vi.fn(),
    load: vi.fn(() => Promise.resolve(null)),
    resetTree: vi.fn(),
  })),
}))
const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({ user: { tenantId: 'acme' } })),
}))
const pageConfigs = vi.hoisted(() => ({
  usePageConfigs: vi.fn(() => ({
    rows: [{ path: '/a', title: 'A', hasTree: true }],
  })),
}))
const publishTarget = vi.hoisted(() => ({
  usePublishTarget: vi.fn(() => [{ path: '/a', tenant: 'acme' }, vi.fn()]),
}))
const collapsedSet = vi.hoisted(() => ({
  useCollapsedSet: vi.fn(() => ({ collapsed: new Set(), toggle: vi.fn() })),
}))
const targetActions = vi.hoisted(() => ({
  useTargetActions: vi.fn(() => ({ save: vi.fn() })),
}))
const undoRedoKeys = vi.hoisted(() => ({ useUndoRedoKeys: vi.fn() }))

vi.mock('./use-component-tree', () => componentTree)
vi.mock(
  '@/app/_components/auth-provider/auth-provider-component',
  () => auth
)
vi.mock('./use-page-configs', () => pageConfigs)
vi.mock('./use-publish-target', () => publishTarget)
vi.mock('./use-collapsed-set', () => collapsedSet)
vi.mock('./use-target-actions', () => targetActions)
vi.mock('./use-undo-redo-keys', () => undoRedoKeys)

import { useWorkbench } from './use-workbench'

describe('useWorkbench', () => {
  it('derives the tenant from the signed-in user', () => {
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.tenant).toBe('acme')
  })

  it('starts on the tree view with setup closed', () => {
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.view).toBe('tree')
    expect(result.current.setupOpen).toBe(false)
  })

  it('toggleSetup flips setupOpen', () => {
    const { result } = renderHook(() => useWorkbench())
    act(() => result.current.toggleSetup())
    expect(result.current.setupOpen).toBe(true)
    act(() => result.current.toggleSetup())
    expect(result.current.setupOpen).toBe(false)
  })

  it('setView switches panes', () => {
    const { result } = renderHook(() => useWorkbench())
    act(() => result.current.setView('setup'))
    expect(result.current.view).toBe('setup')
  })

  it('reports no duplicate id for a selected node with no id', () => {
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.duplicateId).toBe(false)
  })

  it('reports a duplicate id when two nodes share one', () => {
    componentTree.useComponentTree.mockReturnValueOnce({
      tree: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          { id: 'a', type: 'div', props: { id: 'dup' }, children: [] },
          { id: 'b', type: 'div', props: { id: 'dup' }, children: [] },
        ],
      },
      selected: { id: 'a', type: 'div', props: { id: 'dup' }, children: [] },
      undo: vi.fn(),
      redo: vi.fn(),
      load: vi.fn(() => Promise.resolve(null)),
      resetTree: vi.fn(),
    })
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.duplicateId).toBe(true)
  })

  it('only keeps pages with a component tree in trees', () => {
    pageConfigs.usePageConfigs.mockReturnValueOnce({
      rows: [
        { path: '/a', title: 'A', hasTree: true },
        { path: '/b', title: 'B', hasTree: false },
      ],
    })
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.trees).toEqual([
      { path: '/a', title: 'A', hasTree: true },
    ])
  })

  it("resolves currentTree to the target's path when it is a saved tree", () => {
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.currentTree).toBe('/a')
  })

  it('falls back to the blank tree value when the target has no saved tree', () => {
    publishTarget.usePublishTarget.mockReturnValueOnce([
      { path: '/missing', tenant: 'acme' },
      vi.fn(),
    ])
    const { result } = renderHook(() => useWorkbench())
    expect(result.current.currentTree).toBe('__blank__')
  })

  describe('reload on tenant change', () => {
    const mockTree = (
      load: ReturnType<typeof vi.fn>,
      resetTree: ReturnType<typeof vi.fn> = vi.fn()
    ) => {
      componentTree.useComponentTree.mockReturnValue({
        tree: { id: 'root', type: 'root', props: {}, children: [] },
        selected: { id: 'root', type: 'root', props: {}, children: [] },
        undo: vi.fn(),
        redo: vi.fn(),
        load,
        resetTree,
      })
    }

    beforeEach(() => {
      window.localStorage.clear()
      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'acme' } })
    })

    it('reloads on the very first mount, since a fresh sign-in is a full page load, not a re-render', () => {
      const load = vi.fn(() => Promise.resolve(null))
      mockTree(load)
      renderHook(() => useWorkbench())
      expect(load).toHaveBeenCalledWith('acme', '/a')
    })

    it('does not reload on a later mount for a tenant already recorded as loaded', () => {
      window.localStorage.setItem('metabuilder:builder-last-tenant', 'acme')
      const load = vi.fn(() => Promise.resolve(null))
      mockTree(load)
      renderHook(() => useWorkbench())
      expect(load).not.toHaveBeenCalled()
    })

    it('reloads from DBAL when the signed-in tenant changes within a session', () => {
      window.localStorage.setItem('metabuilder:builder-last-tenant', 'acme')
      const load = vi.fn(() => Promise.resolve(null))
      mockTree(load)
      const { rerender } = renderHook(() => useWorkbench())
      expect(load).not.toHaveBeenCalled()

      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'globex' } })
      rerender()

      expect(load).toHaveBeenCalledWith('globex', '/a')
    })

    it('reloads on a fresh page load into a different tenant than was last recorded', () => {
      window.localStorage.setItem('metabuilder:builder-last-tenant', 'previous-tenant')
      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'acme' } })
      const load = vi.fn(() => Promise.resolve(null))
      mockTree(load)
      renderHook(() => useWorkbench())
      expect(load).toHaveBeenCalledWith('acme', '/a')
    })

    it('does not reload again on a re-render for the same tenant', () => {
      window.localStorage.setItem('metabuilder:builder-last-tenant', 'acme')
      const load = vi.fn(() => Promise.resolve(null))
      mockTree(load)
      const { rerender } = renderHook(() => useWorkbench())

      rerender()
      rerender()

      expect(load).not.toHaveBeenCalled()
    })

    it('blanks the tree when the newly signed-in tenant has no saved page, instead of leaving the previous tenant\'s draft on screen', async () => {
      window.localStorage.setItem('metabuilder:builder-last-tenant', 'previous-tenant')
      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'acme' } })
      const load = vi.fn(() => Promise.resolve(null))
      const resetTree = vi.fn()
      mockTree(load, resetTree)

      renderHook(() => useWorkbench())
      await act(async () => {
        await Promise.resolve()
      })

      expect(resetTree).toHaveBeenCalled()
    })

    it('does not blank the tree when the newly signed-in tenant does have a saved page', async () => {
      window.localStorage.setItem('metabuilder:builder-last-tenant', 'previous-tenant')
      auth.useAuthContext.mockReturnValue({ user: { tenantId: 'acme' } })
      const load = vi.fn(() =>
        Promise.resolve({ title: 'A', level: 0, requiresAuth: false })
      )
      const resetTree = vi.fn()
      mockTree(load, resetTree)

      renderHook(() => useWorkbench())
      await act(async () => {
        await Promise.resolve()
      })

      expect(resetTree).not.toHaveBeenCalled()
    })
  })
})
