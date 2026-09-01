import { beforeEach, describe, expect, it, vi } from 'vitest'
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

import { generateMetadata } from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PackagePage generateMetadata', () => {
  it('titles from package metadata', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue(pkgData([]))
    const meta = await generateMetadata(props())
    expect(meta.title).toBe('Blog - acme | MetaBuilder')
    expect(meta.description).toBe('A blog package')
  })

  it('derives a description when metadata description is empty', async () => {
    const data = pkgData([])
    data.metadata.description = ''
    pkgMod.loadJSONPackage.mockResolvedValue(data)
    const meta = await generateMetadata(props())
    expect(meta.description).toBe('Blog package for tenant acme')
  })

  it('titles from a DBAL tenant page when fs load fails', async () => {
    pkgMod.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
    tenantMod.fetchTenantPage.mockResolvedValue({
      isActive: true,
      title: 'Blog Home',
      description: 'Custom desc',
    })
    const meta = await generateMetadata(props())
    expect(meta.title).toBe('Blog Home | acme | MetaBuilder')
    expect(meta.description).toBe('Custom desc')
  })

  it('falls back to a generic title with no fs or DBAL page', async () => {
    pkgMod.loadJSONPackage.mockRejectedValue(new Error('ENOENT'))
    tenantMod.fetchTenantPage.mockResolvedValue(null)
    const meta = await generateMetadata(props('widgets'))
    expect(meta.title).toBe('widgets - acme | MetaBuilder')
    expect(meta.description).toBe('widgets package for tenant acme')
  })
})
