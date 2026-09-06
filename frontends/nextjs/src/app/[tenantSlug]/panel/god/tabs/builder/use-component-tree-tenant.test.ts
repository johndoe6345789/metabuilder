import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import type { TreeNode } from './builder-registry'

const foreign: TreeNode = {
  id: 'root',
  type: 'container',
  props: {},
  children: [
    { id: 'h', type: 'html.h1', props: { text: 'Contact' }, children: [] },
  ],
}

const store = vi.hoisted(() => ({ tree: null as unknown, dirty: false }))
const auth = vi.hoisted(() => ({
  useAuthContext: vi.fn(() => ({
    user: { tenantId: 'acme' },
    isLoading: false,
  })),
}))

const BLANK: TreeNode = { id: 'root', type: 'container', props: {}, children: [] }

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'setTree') store.tree = action.payload
    // The guard clears every tenant-owned key of the slice at once, rather
    // than the tree on its own -- styles persist the same way and were
    // left behind when the guard covered only the tree.
    if (action.type === 'god/resetTenantOwned') store.tree = BLANK
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
    error: null,
    load: vi.fn(async () => true),
    loading: false,
  }),
}))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => auth)

import { useComponentTree } from './use-component-tree'
import { TREE_TENANT_KEY } from './tree-tenant'

/**
 * The draft tree persists per browser origin, not per tenant. The guard for
 * that used to live in useWorkbench -- the Components tab's view model --
 * so any *other* consumer of the tree skipped it. BQL was one: opening its
 * tab on a different tenant appended to the previous tenant's leftover
 * draft and published the result to a live route. Whose tree this is has
 * to be answered by the tree, not by whichever tab happens to ask.
 */
beforeEach(() => {
  window.localStorage.clear()
  store.tree = foreign
  store.dirty = false
  auth.useAuthContext.mockReturnValue({
    user: { tenantId: 'acme' },
    isLoading: false,
  })
})

describe('useComponentTree, on a tree from another tenant', () => {
  it('never hands out the other tenant’s tree, not even for one render', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'globex')

    const { result } = renderHook(() => useComponentTree())

    expect(result.current.tree.children).toEqual([])
  })

  it('clears it from the store rather than only hiding it', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'globex')

    renderHook(() => useComponentTree())

    expect((store.tree as TreeNode).children).toEqual([])
  })

  it('cannot be undone back into the other tenant’s content', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'globex')

    const { result } = renderHook(() => useComponentTree())

    expect(result.current.canUndo).toBe(false)
  })

  it('records the tenant it now holds, so the next mount agrees', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'globex')

    renderHook(() => useComponentTree())

    expect(window.localStorage.getItem(TREE_TENANT_KEY)).toBe('acme')
  })

  it('leaves the tree alone when it belongs to the signed-in tenant', () => {
    window.localStorage.setItem(TREE_TENANT_KEY, 'acme')

    const { result } = renderHook(() => useComponentTree())

    expect(result.current.tree.children).toHaveLength(1)
  })

  it('keeps an unmarked tree, rather than wiping a draft on first upgrade', () => {
    // No marker at all: every install that predates this guard. Blanking
    // here would destroy a legitimate draft to close a window that the
    // marker written on this very mount already closes for every switch
    // after it.
    const { result } = renderHook(() => useComponentTree())

    expect(result.current.tree.children).toHaveLength(1)
    expect(window.localStorage.getItem(TREE_TENANT_KEY)).toBe('acme')
  })
})

describe('useComponentTree tenant guard, adversarially', () => {
  /**
   * Ways this could wipe a tree it should have kept. Each is a real state
   * the app passes through, not a hypothetical.
   */
  describe('does not mistake a half-known tenant for another one', () => {
    it('leaves the tree alone while auth is still resolving', () => {
      // normalizeTenantId(undefined) is "system", so during the render
      // before auth resolves, every tenant's tree looks foreign. Acting on
      // that would blank a real draft on every single page load.
      window.localStorage.setItem(TREE_TENANT_KEY, 'acme')
      auth.useAuthContext.mockReturnValue({ user: null, isLoading: true })

      const { result } = renderHook(() => useComponentTree())

      expect(result.current.tree.children).toHaveLength(1)
      expect(window.localStorage.getItem(TREE_TENANT_KEY)).toBe('acme')
    })

    it('leaves the tree alone when signed out entirely', () => {
      window.localStorage.setItem(TREE_TENANT_KEY, 'acme')
      auth.useAuthContext.mockReturnValue({ user: null, isLoading: false })

      const { result } = renderHook(() => useComponentTree())

      expect(result.current.tree.children).toHaveLength(1)
      expect(window.localStorage.getItem(TREE_TENANT_KEY)).toBe('acme')
    })

    it('still guards once auth resolves to a different tenant', () => {
      window.localStorage.setItem(TREE_TENANT_KEY, 'globex')
      auth.useAuthContext.mockReturnValue({ user: null, isLoading: true })
      const { result, rerender } = renderHook(() => useComponentTree())
      expect(result.current.tree.children).toHaveLength(1)

      auth.useAuthContext.mockReturnValue({
        user: { tenantId: 'acme' },
        isLoading: false,
      })
      rerender()

      expect(result.current.tree.children).toEqual([])
    })
  })

  describe('when the browser refuses local storage', () => {
    /**
     * Safari in private mode, and any browser with site data blocked,
     * throws on localStorage rather than returning null. An unhandled
     * throw here takes the whole builder down, so the guard has to fail
     * open -- keeping the tree -- rather than failing loudly.
     */
    const withBrokenStorage = (fn: () => void) => {
      const real = Object.getOwnPropertyDescriptor(window, 'localStorage')
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('The operation is insecure.')
        },
      })
      try {
        fn()
      } finally {
        if (real) Object.defineProperty(window, 'localStorage', real)
      }
    }

    it('still renders the builder instead of throwing', () => {
      withBrokenStorage(() => {
        const { result } = renderHook(() => useComponentTree())
        expect(result.current.tree).toBeDefined()
      })
    })
  })
})
