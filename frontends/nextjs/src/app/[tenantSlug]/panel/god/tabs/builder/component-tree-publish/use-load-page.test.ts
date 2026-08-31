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

function mockFetch(row: Record<string, unknown> | null, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      json: async () => ({ data: { data: row === null ? [] : [row] } }),
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

describe('useLoadPage null cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns null when the lookup fails', async () => {
    mockFetch(null, false)
    const { result } = renderHook(() => useLoadPage(dispatch))

    expect(await load(result)).toBeNull()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('returns null when no row owns the path', async () => {
    mockFetch(null)
    const { result } = renderHook(() => useLoadPage(dispatch))

    expect(await load(result)).toBeNull()
  })

  it('returns null when the row has no pageTreeId', async () => {
    mockFetch({ id: 'p1', title: 'About' })
    const { result } = renderHook(() => useLoadPage(dispatch))

    expect(await load(result)).toBeNull()
  })

  it('returns null when the tree cannot be parsed', async () => {
    mockFetch({ id: 'p1', pageTreeId: 'tree_1' })
    pageTree.loadTree.mockResolvedValue(null)
    const { result } = renderHook(() => useLoadPage(dispatch))

    expect(await load(result)).toBeNull()
  })
})
