import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const tree = vi.hoisted(() => ({ loadTree: vi.fn() }))
vi.mock('@/lib/tenant/page-tree', () => tree)

import { fetchSlot } from './workspace-slot-data'

const envelope = (rows: unknown[]) => ({ data: { data: rows } })

const row = (over: Record<string, unknown> = {}) => ({
  isPublished: true,
  level: 2,
  component: 'dashboard_home',
  ...over,
})

const stub = (ok: boolean, body?: unknown): string[] => {
  const asked: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      asked.push(String(url))
      return { ok, json: async () => body ?? envelope([]) } as Response
    })
  )
  return asked
}

beforeEach(() => {
  vi.clearAllMocks()
  tree.loadTree.mockResolvedValue({ id: 'root' })
})
afterEach(() => vi.unstubAllGlobals())

describe('fetchSlot', () => {
  it('filters by the requested path', async () => {
    const asked = stub(true, envelope([row()]))
    await fetchSlot('acme', '/dashboard')
    expect(asked[0]).toContain('/acme/core/PageConfig')
    expect(asked[0]).toContain('filter.path=%2Fdashboard')
  })

  it('resolves a published row naming a component', async () => {
    stub(true, envelope([row()]))
    expect(await fetchSlot('acme', '/dashboard')).toMatchObject({
      level: 2,
      component: 'dashboard_home',
      componentTree: null,
    })
  })

  it('is null when the request is refused', async () => {
    stub(false)
    expect(await fetchSlot('acme', '/x')).toBeNull()
  })

  it('is null rather than throwing when unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    expect(await fetchSlot('acme', '/x')).toBeNull()
  })

  it('is null when nothing is published at this path', async () => {
    stub(true, envelope([]))
    expect(await fetchSlot('acme', '/x')).toBeNull()
  })

  // The published half of the row's own contract: an unpublished draft
  // must never render in place of the page's real fallback.
  it('skips an unpublished row', async () => {
    stub(true, envelope([row({ isPublished: false })]))
    expect(await fetchSlot('acme', '/x')).toBeNull()
  })

  it('treats an absent isPublished as published', async () => {
    const { isPublished, ...rest } = row()
    void isPublished
    stub(true, envelope([rest]))
    expect(await fetchSlot('acme', '/x')).not.toBeNull()
  })

  it('loads the tree when the row names one instead of a component', async () => {
    stub(true, envelope([row({ component: null, pageTreeId: 'tree1' })]))
    const slot = await fetchSlot('acme', '/x')
    expect(tree.loadTree).toHaveBeenCalledWith(expect.any(String), 'acme', 'tree1')
    expect(slot?.componentTree).toEqual({ id: 'root' })
    expect(slot?.component).toBeNull()
  })

  it('does not load a tree when the row names neither', async () => {
    stub(true, envelope([row({ component: null })]))
    expect(await fetchSlot('acme', '/x')).toBeNull()
    expect(tree.loadTree).not.toHaveBeenCalled()
  })

  it('defaults the level to 0 when the row does not set one', async () => {
    stub(true, envelope([row({ level: undefined })]))
    expect((await fetchSlot('acme', '/x'))?.level).toBe(0)
  })

  it('picks the first published row when more than one exists', async () => {
    stub(
      true,
      envelope([
        row({ isPublished: false, component: 'draft' }),
        row({ component: 'live' }),
      ])
    )
    expect((await fetchSlot('acme', '/x'))?.component).toBe('live')
  })
})
