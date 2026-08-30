import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const tree = vi.hoisted(() => ({ loadTree: vi.fn() }))
vi.mock('@/lib/tenant/page-tree', () => tree)

import { fetchTenantPage, fetchTenantPages } from './fetch-tenant-page'

const envelope = (rows: unknown[]) => ({ data: { data: rows } })

const page = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  path: '/home',
  title: 'Home',
  isActive: true,
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

describe('fetchTenantPage', () => {
  it('filters by the requested path', async () => {
    const asked = stub(true, envelope([page()]))
    await fetchTenantPage('acme', '/home')
    expect(asked[0]).toContain('/acme/core/PageConfig')
    expect(asked[0]).toContain('filter.path=%2Fhome')
  })

  it('returns the matching, active page', async () => {
    stub(true, envelope([page()]))
    const result = await fetchTenantPage('acme', '/home')
    expect(result).toMatchObject({ id: 'p1', path: '/home', title: 'Home' })
  })

  // isPublished is the older field name; a page saved before isActive
  // existed must still resolve as visible.
  it('falls back to isPublished when isActive is absent', async () => {
    stub(
      true,
      envelope([{ ...page(), isActive: undefined, isPublished: true }])
    )
    expect(await fetchTenantPage('acme', '/home')).not.toBeNull()
  })

  it('is null when the only match is inactive', async () => {
    stub(true, envelope([{ ...page(), isActive: false }]))
    expect(await fetchTenantPage('acme', '/home')).toBeNull()
  })

  it('is null when nothing matches at all', async () => {
    stub(true, envelope([]))
    expect(await fetchTenantPage('acme', '/home')).toBeNull()
  })

  it('is null when the request is refused', async () => {
    stub(false)
    expect(await fetchTenantPage('acme', '/home')).toBeNull()
  })

  it('is null rather than throwing when the data layer is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    }))
    expect(await fetchTenantPage('acme', '/home')).toBeNull()
  })

  it('loads the component tree when the page names one', async () => {
    stub(true, envelope([page({ pageTreeId: 'tree1' })]))
    const result = await fetchTenantPage('acme', '/home')
    expect(tree.loadTree).toHaveBeenCalledWith(
      expect.any(String),
      'acme',
      'tree1'
    )
    expect(result?.componentTree).toEqual({ id: 'root' })
  })

  it('does not load a tree when the page names none', async () => {
    stub(true, envelope([page({ pageTreeId: null })]))
    await fetchTenantPage('acme', '/home')
    expect(tree.loadTree).not.toHaveBeenCalled()
  })

  it('applies the same defaults normalize applies elsewhere', async () => {
    stub(true, envelope([page()]))
    const result = await fetchTenantPage('acme', '/home')
    expect(result).toMatchObject({
      level: 1,
      requiresAuth: false,
      requiredRole: null,
    })
  })
})

describe('fetchTenantPages', () => {
  it('lists every page for the tenant', async () => {
    const asked = stub(true, envelope([page(), page({ id: 'p2' })]))
    const result = await fetchTenantPages('acme')
    expect(asked[0]).toContain('/acme/core/PageConfig')
    expect(result).toHaveLength(2)
  })

  it('does not filter by path', async () => {
    const asked = stub(true, envelope([]))
    await fetchTenantPages('acme')
    expect(asked[0]).not.toContain('filter.path')
  })

  it('is empty when the request is refused', async () => {
    stub(false)
    expect(await fetchTenantPages('acme')).toEqual([])
  })

  it('is empty rather than throwing when unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('offline')
    }))
    expect(await fetchTenantPages('acme')).toEqual([])
  })

  it('returns pages with an unloaded component tree', async () => {
    stub(true, envelope([page({ pageTreeId: 'tree1' })]))
    const [result] = await fetchTenantPages('acme')
    expect(result?.componentTree).toBeNull()
    expect(tree.loadTree).not.toHaveBeenCalled()
  })
})
