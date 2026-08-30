import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const tree = vi.hoisted(() => ({
  saveTree: vi.fn(async () => true),
}))
vi.mock('@/lib/tenant/page-tree', () => tree)

import {
  createDefaultPages,
  normalizeTenant,
  SYSTEM_TENANT,
  treeIdFor,
} from './packages-tab-data'

const pkg = (over: Record<string, unknown> = {}) => ({
  id: 'blog',
  name: 'Blog',
  color: '#000',
  icon: 'x',
  tagline: '',
  features: [],
  defaultRoutes: [{ path: '/blog', title: 'Blog' }],
  ...over,
})

describe('normalizeTenant', () => {
  it('keeps a real tenant name', () => {
    expect(normalizeTenant('acme')).toBe('acme')
  })

  it.each(['', '   '])('falls back to system for %p', input => {
    expect(normalizeTenant(input)).toBe(SYSTEM_TENANT)
  })
})

describe('treeIdFor', () => {
  it('combines the package id and a sanitised path', () => {
    expect(treeIdFor({ id: 'blog' }, '/posts')).toBe('tree_blog__posts')
  })

  it('strips characters a DBAL id cannot carry', () => {
    expect(treeIdFor({ id: 'blog' }, '/a/b?x=1')).toBe('tree_blog__a_b_x_1')
  })
})

describe('createDefaultPages', () => {
  const stub = (ok = true): string[] => {
    const asked: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        asked.push(String(url))
        return { ok } as Response
      })
    )
    return asked
  }

  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllGlobals())

  it('writes one page per default route', async () => {
    const asked = stub()
    await createDefaultPages('acme', pkg({ defaultRoutes: [
      { path: '/a', title: 'A' },
      { path: '/b', title: 'B' },
    ] }))
    expect(asked).toHaveLength(2)
  })

  it('posts to the tenant\'s own PageConfig collection', async () => {
    const asked = stub()
    await createDefaultPages('acme', pkg())
    expect(asked[0]).toContain('/acme/core/PageConfig')
  })

  // A package's starter pages are meant to be visible the moment it's
  // installed, with no auth wall the tenant did not ask for.
  it('publishes every default route as public, live, with no auth', async () => {
    let body: Record<string, unknown> = {}
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        body = JSON.parse(init?.body as string) as Record<string, unknown>
        return { ok: true } as Response
      })
    )
    await createDefaultPages('acme', pkg())
    expect(body).toMatchObject({
      isPublished: true,
      level: 0,
      requiresAuth: false,
      tenantId: 'acme',
      packageId: 'blog',
    })
  })

  it('stamps the tree id when the tree saved successfully', async () => {
    stub()
    tree.saveTree.mockResolvedValue(true)
    let body: Record<string, unknown> = {}
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        body = JSON.parse(init?.body as string) as Record<string, unknown>
        return { ok: true } as Response
      })
    )
    await createDefaultPages('acme', pkg())
    expect(body.pageTreeId).toBe(treeIdFor(pkg(), '/blog'))
  })

  it('leaves pageTreeId null when the tree failed to save', async () => {
    tree.saveTree.mockResolvedValue(false)
    let body: Record<string, unknown> = {}
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        body = JSON.parse(init?.body as string) as Record<string, unknown>
        return { ok: true } as Response
      })
    )
    await createDefaultPages('acme', pkg())
    expect(body.pageTreeId).toBeNull()
  })
})
