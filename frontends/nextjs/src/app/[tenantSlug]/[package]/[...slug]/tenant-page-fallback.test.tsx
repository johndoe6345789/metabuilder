import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const tenantPage = vi.hoisted(() => ({ fetchTenantPage: vi.fn() }))
vi.mock('@/lib/tenant/fetch-tenant-page', () => tenantPage)

vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => ({
  UIPageRenderer: ({ layout }: { layout: unknown }) => (
    <div data-testid="ui-page-renderer">{JSON.stringify(layout)}</div>
  ),
}))

import { tenantPageFallback } from './tenant-page-fallback'

describe('tenantPageFallback', () => {
  it('returns null when no page is found', async () => {
    tenantPage.fetchTenantPage.mockResolvedValue(null)
    const result = await tenantPageFallback('acme', 'blog', ['posts'])
    expect(result).toBeNull()
    expect(tenantPage.fetchTenantPage).toHaveBeenCalledWith(
      'acme',
      '/blog/posts'
    )
  })

  it('returns null when the page is not active', async () => {
    tenantPage.fetchTenantPage.mockResolvedValue({
      isActive: false,
      componentTree: { type: 'div', children: [] },
    })
    const result = await tenantPageFallback('acme', 'blog', ['posts'])
    expect(result).toBeNull()
  })

  it('returns null when componentTree is null or undefined', async () => {
    tenantPage.fetchTenantPage.mockResolvedValue({
      isActive: true,
      componentTree: null,
    })
    const result = await tenantPageFallback('acme', 'blog', ['posts'])
    expect(result).toBeNull()
  })

  it('renders UIPageRenderer when an active page with a tree is found', async () => {
    tenantPage.fetchTenantPage.mockResolvedValue({
      isActive: true,
      componentTree: { type: 'div', children: [] },
    })
    const result = await tenantPageFallback('acme', 'blog', ['posts'])
    if (result === null) throw new Error('expected a rendered element')
    render(result)
    expect(screen.getByTestId('ui-page-renderer')).toBeTruthy()
  })
})
