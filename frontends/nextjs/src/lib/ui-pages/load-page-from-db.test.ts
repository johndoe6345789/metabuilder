import { beforeEach, describe, expect, it, vi } from 'vitest'

const ops = vi.hoisted(() => ({ list: vi.fn() }))
const pageTree = vi.hoisted(() => ({ loadTree: vi.fn() }))

vi.mock('@/lib/db-client', () => ({ db: { pageConfigs: ops } }))
vi.mock('@/lib/tenant/page-tree', () => pageTree)

import { loadPageFromDb } from './load-page-from-db'

const row = (overrides?: Record<string, unknown>) => ({
  id: 'p1',
  tenantId: 'acme',
  packageId: 'blog',
  path: '/blog',
  title: 'Blog',
  component: 'BlogPage',
  level: 1,
  requiresAuth: false,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  ops.list.mockResolvedValue({ data: [] })
})

describe('loadPageFromDb', () => {
  it('returns null when no page matches', async () => {
    expect(await loadPageFromDb('/missing')).toBeNull()
  })

  it('filters by path and isPublished', async () => {
    await loadPageFromDb('/blog')
    expect(ops.list).toHaveBeenCalledWith({
      filter: { path: '/blog', isPublished: true },
    })
  })

  it('adds tenantId to the filter when given', async () => {
    await loadPageFromDb('/blog', 'acme')
    expect(ops.list).toHaveBeenCalledWith({
      filter: { path: '/blog', isPublished: true, tenantId: 'acme' },
    })
  })

  it('maps a matching row to a PageConfig', async () => {
    ops.list.mockResolvedValue({ data: [row()] })

    const page = await loadPageFromDb('/blog')

    expect(page).toMatchObject({
      id: 'p1',
      tenantId: 'acme',
      packageId: 'blog',
      path: '/blog',
      title: 'Blog',
      component: 'BlogPage',
      level: 1,
      accessLevel: 1,
      requiresAuth: false,
      componentTree: null,
    })
  })

  it('loads the component tree when pageTreeId is a string', async () => {
    ops.list.mockResolvedValue({ data: [row({ pageTreeId: 'tree1' })] })
    pageTree.loadTree.mockResolvedValue({ id: 'tree1', nodes: [] })

    const page = await loadPageFromDb('/blog')

    expect(pageTree.loadTree).toHaveBeenCalledWith(
      expect.any(String),
      'acme',
      'tree1'
    )
    expect(page?.componentTree).toEqual({ id: 'tree1', nodes: [] })
  })

  it('loads the tree under "system" when the row has no tenantId', async () => {
    ops.list.mockResolvedValue({
      data: [row({ tenantId: null, pageTreeId: 'tree1' })],
    })
    pageTree.loadTree.mockResolvedValue(null)

    await loadPageFromDb('/blog')

    expect(pageTree.loadTree).toHaveBeenCalledWith(
      expect.any(String),
      'system',
      'tree1'
    )
  })

  it('converts createdAt/updatedAt to numbers when present', async () => {
    ops.list.mockResolvedValue({
      data: [row({ createdAt: '1700000000', updatedAt: '1700000100' })],
    })

    const page = await loadPageFromDb('/blog')

    expect(page?.createdAt).toBe(1700000000)
    expect(page?.updatedAt).toBe(1700000100)
  })

  it('leaves createdAt/updatedAt undefined when absent', async () => {
    ops.list.mockResolvedValue({ data: [row()] })

    const page = await loadPageFromDb('/blog')

    expect(page?.createdAt).toBeUndefined()
    expect(page?.updatedAt).toBeUndefined()
  })
})
