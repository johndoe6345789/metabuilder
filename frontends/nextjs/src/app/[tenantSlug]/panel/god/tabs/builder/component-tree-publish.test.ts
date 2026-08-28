import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const pageTree = vi.hoisted(() => ({
  loadTree: vi.fn(),
  saveTree: vi.fn(async () => true),
}))
const dispatch = vi.hoisted(() => vi.fn())
const versions = vi.hoisted(() => ({ snapshot: vi.fn() }))

vi.mock('@/lib/tenant/page-tree', () => pageTree)
vi.mock('@/store/hooks', () => ({ useAppDispatch: () => dispatch }))
vi.mock('@/lib/persist/versions', () => versions)
vi.mock('@/store/slices/god-slice', () => ({
  clearDirty: vi.fn(() => ({ type: 'clearDirty' })),
  setTree: vi.fn((p: unknown) => ({ type: 'setTree', payload: p })),
}))

import {
  DEFAULT_PUBLISH_TARGET,
  useComponentTreePublish,
} from './component-tree-publish'

const tree = { id: 'root', type: 'html.section', props: {}, children: [] }

/** No row owns the path unless a test says one does. */
function mockFetch(owner: Record<string, unknown> | null = null, ok = true) {
  const calls: { url: string; method: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? 'GET' })
      return {
        ok,
        status: ok ? 200 : 500,
        json: async () => ({ data: { data: owner === null ? [] : [owner] } }),
      } as Response
    })
  )
  return calls
}

const publish = async (
  hook: { current: ReturnType<typeof useComponentTreePublish> },
  target = DEFAULT_PUBLISH_TARGET
) => {
  let result = false
  await act(async () => {
    result = await hook.current.publish(target)
  })
  return result
}

describe('useComponentTreePublish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pageTree.saveTree.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('publishing a fresh path', () => {
    it('creates the page row', async () => {
      const calls = mockFetch(null)
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      expect(await publish(result)).toBe(true)
      expect(calls.some(c => c.method === 'POST')).toBe(true)
    })

    it('reports no conflict', async () => {
      mockFetch(null)
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(result.current.conflict).toBeNull()
    })

    it('saves the tree before writing the page row', async () => {
      mockFetch(null)
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(pageTree.saveTree).toHaveBeenCalled()
    })

    it('gives up when the tree cannot be saved', async () => {
      // Publishing a page that points at a tree that was never written
      // would render an empty page rather than fail visibly.
      pageTree.saveTree.mockResolvedValue(false)
      const calls = mockFetch(null)
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      expect(await publish(result)).toBe(false)
      expect(calls.some(c => c.method === 'POST')).toBe(false)
    })
  })

  describe('republishing a path this builder owns', () => {
    it('updates the existing row rather than creating a second one', async () => {
      // `path` is UNIQUE, so a second POST would just 409.
      const calls = mockFetch({ id: 'page_1', component: 'component_tree' })
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(calls.some(c => c.method === 'PUT')).toBe(true)
      expect(calls.some(c => c.method === 'POST')).toBe(false)
    })

    it('does not warn about a takeover', async () => {
      mockFetch({ id: 'page_1', component: 'component_tree' })
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(result.current.conflict).toBeNull()
    })
  })

  describe('taking a path over from a package', () => {
    it('says what it displaced and how to undo it', async () => {
      mockFetch({
        id: 'page_1',
        packageId: 'ui_home',
        component: 'HomePage',
      })
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(result.current.conflict).toContain('ui_home')
      expect(result.current.conflict).toContain('HomePage')
    })

    it('keeps the displaced row id so it can be restored', async () => {
      const calls = mockFetch({
        id: 'page_1',
        packageId: 'ui_home',
        component: 'HomePage',
      })
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(calls.some(c => c.url.endsWith('/page_1'))).toBe(true)
    })
  })

  describe('when the lookup fails', () => {
    it('creates rather than blocking the publish', async () => {
      const calls = mockFetch(null, false)
      const { result } = renderHook(() => useComponentTreePublish(tree as never))

      await publish(result)

      expect(calls.some(c => c.method === 'POST')).toBe(true)
    })
  })

  describe('the default target', () => {
    it('is the public home page of the system tenant', () => {
      expect(DEFAULT_PUBLISH_TARGET).toEqual({
        tenant: 'system',
        path: '/',
        title: 'Home',
        level: 0,
        requiresAuth: false,
      })
    })
  })
})
