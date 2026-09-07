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

import PackagePage, { generateMetadata } from './page'

const gated = {
  isActive: true,
  title: 'Board minutes',
  description: 'Internal',
  componentTree: { id: 'secret' },
  level: 3,
  requiresAuth: false,
  requiredRole: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  accessMod.mayViewPage.mockResolvedValue(true)
  pkgMod.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
})

/**
 * The founder-facing pickers call level 3 "Admin only". This route fetched
 * the page's level, requiresAuth and requiredRole and rendered the tree
 * without consulting any of them.
 */
describe('a published page the founder restricted', () => {
  it('is not rendered to a visitor who may not see it', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue(gated)
    accessMod.mayViewPage.mockResolvedValue(false)

    await expect(PackagePage(props())).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('is rendered to a visitor who may', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue(gated)

    const { container } = render(await PackagePage(props()))
    expect(container.textContent).toContain('secret')
  })

  // The title and description are content too: "Board minutes -- Internal"
  // in a tab, a search result or a link preview gives the page away.
  it('does not describe itself to a visitor who may not see it', async () => {
    tenantMod.fetchTenantPage.mockResolvedValue(gated)
    accessMod.mayViewPage.mockResolvedValue(false)

    const meta = await generateMetadata(props())
    expect(JSON.stringify(meta)).not.toContain('Board minutes')
    expect(JSON.stringify(meta)).not.toContain('Internal')
  })
})
