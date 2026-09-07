import { beforeEach, describe, expect, it, vi } from 'vitest'

const tenantMod = vi.hoisted(() => ({ fetchTenantPage: vi.fn() }))
vi.mock('@/lib/tenant/fetch-tenant-page', () => tenantMod)

const access = vi.hoisted(() => ({ mayViewPage: vi.fn() }))
vi.mock('@/lib/tenant/page-access', () => access)

import { generateMetadata } from './page'

const props = (tenantSlug = 'acme') => ({
  params: Promise.resolve({ tenantSlug }),
})

beforeEach(() => {
  vi.clearAllMocks()
  access.mayViewPage.mockResolvedValue(true)
})

/**
 * /{tenant} is the URL a founder actually hands out. Every other published
 * route is a server component with generateMetadata; this one was built as
 * the signed-in user's *workspace* and later repurposed as their public
 * page, keeping the client-only rendering that suited the former. So it
 * could carry no metadata at all: the tab read "MetaBuilder - Data-Driven
 * Application Platform" and a shared link previewed as nothing.
 */
describe('the tenant home page describes itself', () => {
  it('titles from the page the founder published', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue({
      isActive: true,
      title: 'Harbour Cycle Works',
      description: 'Repairs and restorations in Bristol',
    })
    const meta = await generateMetadata(props())

    expect(meta.title).toBe('Harbour Cycle Works')
    expect(meta.description).toBe('Repairs and restorations in Bristol')
  })

  // A bare URL with no card is what a founder gets when they paste their
  // own link anywhere.
  it('carries a preview card for wherever the link is pasted', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue({
      isActive: true,
      title: 'Harbour Cycle Works',
      description: 'Repairs in Bristol',
    })
    const meta = await generateMetadata(props())

    expect(meta.openGraph?.title).toBe('Harbour Cycle Works')
    expect(meta.twitter?.title).toBe('Harbour Cycle Works')
  })

  it('says only the tenant name when nothing is published', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue(null)
    expect((await generateMetadata(props())).title).toBe('acme')
  })

  it('does not describe a page this visitor may not see', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue({
      isActive: true,
      title: 'Board minutes',
      description: 'Internal',
      level: 4,
    })
    access.mayViewPage.mockResolvedValue(false)

    const meta = await generateMetadata(props())
    expect(JSON.stringify(meta)).not.toContain('Board minutes')
  })
})
