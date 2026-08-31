import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const pageTree = vi.hoisted(() => ({ loadTree: vi.fn() }))
const dispatch = vi.hoisted(() => vi.fn())

vi.mock('@/lib/tenant/page-tree', () => pageTree)
vi.mock('@/store/slices/god-slice', () => ({
  clearDirty: vi.fn(() => ({ type: 'clearDirty' })),
  setTree: vi.fn((p: unknown) => ({ type: 'setTree', payload: p })),
}))

import { useLoadPage } from './use-load-page'

function mockFetch(row: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { data: [row] } }),
    }))
  )
}

const load = async (
  hook: { current: ReturnType<typeof useLoadPage> },
  tenant = 'acme',
  path = '/about'
) => {
  let value: Awaited<ReturnType<typeof hook.current.load>> = null
  await act(async () => {
    value = await hook.current.load(tenant, path)
  })
  return value
}

describe('useLoadPage success', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads the tree and reports the page fields, defaulting missing ones', async () => {
    mockFetch({ id: 'p1', pageTreeId: 'tree_1', title: 'About Us' })
    pageTree.loadTree.mockResolvedValue({ id: 'root' })
    const { result } = renderHook(() => useLoadPage(dispatch))

    expect(await load(result)).toEqual({
      title: 'About Us',
      level: 0,
      requiresAuth: false,
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setTree',
      payload: { id: 'root' },
    })
    expect(dispatch).toHaveBeenCalledWith({ type: 'clearDirty' })
  })

  it('falls back to the path when the row has no title', async () => {
    mockFetch({ id: 'p1', pageTreeId: 'tree_1' })
    pageTree.loadTree.mockResolvedValue({ id: 'root' })
    const { result } = renderHook(() => useLoadPage(dispatch))

    expect(await load(result)).toMatchObject({ title: '/about' })
  })
})
