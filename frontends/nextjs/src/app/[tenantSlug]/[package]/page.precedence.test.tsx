import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import {
  pkgMod,
  renderMod,
  tenantMod,
  accessMod,
  navMod,
  mockUIPageRenderer,
  props,
} from './page-test-mocks'

vi.mock('@/lib/packages/json/functions/load-json-package', () => pkgMod)
vi.mock('@/lib/packages/json/render-json-component', () => renderMod)
vi.mock('@/lib/tenant/fetch-tenant-page', () => tenantMod)
vi.mock('@/lib/tenant/page-access', () => accessMod)
vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => ({
  UIPageRenderer: mockUIPageRenderer,
}))
vi.mock('next/navigation', () => navMod)

import PackagePage from './page'

beforeEach(() => {
  vi.clearAllMocks()
  accessMod.mayViewPage.mockResolvedValue(true)
})

/**
 * `packages/` ships directories called admin, dashboard, global, examples
 * and two dozen more. Those are packages that *exist*, not ones this
 * tenant installed -- and the route loaded one before it ever asked what
 * the founder had published. So every community had those paths quietly
 * reserved: publish a page at /dashboard, and the built-in package's home
 * component rendered instead, with nothing in the builder saying why.
 */
describe('a founder who publishes at a name a package already has', () => {
  const own = {
    isActive: true,
    title: 'Our dashboard',
    componentTree: { id: 'ours' },
    level: 0,
  }

  it('gets their own page, not the built-in one', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue({
      metadata: { packageId: 'dashboard', name: 'Dashboard', version: '1' },
      components: [{ id: 'home_page', name: 'Home' }],
    })
    tenantMod.fetchTenantPage.mockResolvedValue(own)

    const { container } = render(await PackagePage(props('dashboard')))

    expect(container.textContent).toContain('ours')
    expect(container.textContent).not.toContain('home_page')
  })

  it('still gets the built-in one when they published nothing', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue({
      metadata: { packageId: 'dashboard', name: 'Dashboard', version: '1' },
      components: [{ id: 'home_page', name: 'Home' }],
    })
    tenantMod.fetchTenantPage.mockResolvedValue(null)

    const { container } = render(await PackagePage(props('dashboard')))

    expect(container.textContent).toContain('home_page')
  })

  // notFound() signals by throwing and used to sit inside a try whose
  // catch swallowed it straight into the fallback.
  it('404s when there is neither', async () => {
    pkgMod.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
    tenantMod.fetchTenantPage.mockResolvedValue(null)

    await expect(PackagePage(props('nothing'))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    )
  })
})
