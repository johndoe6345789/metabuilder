import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  pkgMod,
  renderMod,
  tenantMod,
  navMod,
  mockUIPageRenderer,
  props,
  pkgData,
} from './page-test-mocks'

vi.mock('@/lib/packages/json/functions/load-json-package', () => pkgMod)
vi.mock('@/lib/packages/json/render-json-component', () => renderMod)
vi.mock('@/lib/tenant/fetch-tenant-page', () => tenantMod)
vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => ({
  UIPageRenderer: mockUIPageRenderer,
}))
vi.mock('next/navigation', () => navMod)

import PackagePage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PackagePage DBAL fallback', () => {
  it('falls through to the DBAL lookup with no components', async () => {
    // notFound() throws, which the broad catch below swallows -- so an
    // empty fs package still tries the DBAL tenant-page fallback.
    pkgMod.loadJSONPackage.mockResolvedValue(pkgData([]))
    tenantMod.fetchTenantPage.mockResolvedValue(null)
    await expect(PackagePage(props())).rejects.toThrow('NEXT_NOT_FOUND')
    expect(tenantMod.fetchTenantPage).toHaveBeenCalledWith('acme', '/blog')
  })

  it('renders a DBAL tenant page when the fs package load fails', async () => {
    pkgMod.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
    tenantMod.fetchTenantPage.mockResolvedValue({
      isActive: true,
      componentTree: { type: 'div', children: [] },
    })
    const result = await PackagePage(props())
    render(result)
    expect(screen.getByTestId('ui-page-renderer')).toBeTruthy()
    expect(tenantMod.fetchTenantPage).toHaveBeenCalledWith('acme', '/blog')
  })

  it.each([
    [null],
    [{ isActive: false, componentTree: { type: 'div' } }],
    [{ isActive: true, componentTree: null }],
  ])('calls notFound for a bad tenant page fallback %#', async page => {
    pkgMod.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
    tenantMod.fetchTenantPage.mockResolvedValue(page)
    await expect(PackagePage(props())).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
