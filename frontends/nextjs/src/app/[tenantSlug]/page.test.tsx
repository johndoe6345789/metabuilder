import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

const tenantMod = vi.hoisted(() => ({ fetchTenantPage: vi.fn() }))
vi.mock('@/lib/tenant/fetch-tenant-page', () => tenantMod)

const access = vi.hoisted(() => ({ mayViewPage: vi.fn() }))
vi.mock('@/lib/tenant/page-access', () => access)

vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => ({
  UIPageRenderer: ({ layout }: { layout: unknown }) => (
    <div data-testid="rendered">{JSON.stringify(layout)}</div>
  ),
}))
vi.mock('./TenantHomeFallback', () => ({
  TenantHomeFallback: ({ tenant }: { tenant: string }) => (
    <div data-testid="fallback">{tenant}</div>
  ),
}))

import TenantHomePage from './page'

const props = (tenantSlug?: string) => ({
  params: Promise.resolve({ tenantSlug }),
})

const published = {
  isActive: true,
  title: 'Harbour Cycle Works',
  componentTree: { id: 'home' },
  level: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  access.mayViewPage.mockResolvedValue(true)
  tenantMod.fetchTenantPage.mockResolvedValue(null)
})

/**
 * The one URL a founder hands out. It renders on the server like every
 * other published route, so a crawler and a link preview get the page
 * rather than an empty document.
 */
describe('TenantHomePage', () => {
  it('renders the published tree on the server', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue(published)
    const { container } = render(await TenantHomePage(props('acme')))
    expect(container.textContent).toContain('home')
  })

  it('asks for the home path of the tenant in the URL', async () => {
    await TenantHomePage(props('acme'))
    expect(tenantMod.fetchTenantPage).toHaveBeenCalledWith('acme', '/')
  })

  it('normalizes a slug containing a slash', async () => {
    await TenantHomePage(props('acme/sub'))
    expect(tenantMod.fetchTenantPage).toHaveBeenCalledWith('acme-sub', '/')
  })

  it('falls back to the default tenant when the slug is missing', async () => {
    await TenantHomePage(props())
    expect(tenantMod.fetchTenantPage).toHaveBeenCalledWith('system', '/')
  })

  it('hands over to the client slot when nothing is published', async () => {
    const { container } = render(await TenantHomePage(props('acme')))
    expect(container.textContent).toContain('acme')
  })

  // Server-rendering must not become a way around the gate: the client slot
  // applies LevelGate, so a restricted page still says so.
  it('does not server-render a page this visitor may not see', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue({ ...published, level: 4 })
    access.mayViewPage.mockResolvedValue(false)
    const { container } = render(await TenantHomePage(props('acme')))
    expect(container.textContent).not.toContain('home')
  })
})
