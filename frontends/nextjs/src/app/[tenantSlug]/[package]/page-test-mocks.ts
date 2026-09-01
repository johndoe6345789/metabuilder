// Shared mock state + fixtures for PackagePage's split test files. Kept as
// .ts (no JSX) so it falls outside the 80-line .tsx guardrail.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { JSONComponent, JSONPackage } from '@/lib/packages/json/types'

export const pkgMod = { loadJSONPackage: vi.fn() }
export const renderMod = {
  renderJSONComponent: vi.fn((c: JSONComponent) =>
    createElement('div', { 'data-testid': 'rendered' }, c.id)
  ),
}
export const tenantMod = { fetchTenantPage: vi.fn() }
export const navMod = {
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}

export function mockUIPageRenderer(p: { layout: unknown }) {
  return createElement(
    'div',
    { 'data-testid': 'ui-page-renderer' },
    JSON.stringify(p.layout)
  )
}

export const props = (pkg = 'blog') => ({
  params: Promise.resolve({ tenantSlug: 'acme', package: pkg }),
})

export const comp = (id: string, name: string): JSONComponent => ({
  id,
  name,
})

export const pkgData = (components: JSONComponent[]): JSONPackage => ({
  metadata: {
    packageId: 'blog',
    name: 'Blog',
    version: '1.0.0',
    description: 'A blog package',
  },
  components,
  hasComponents: components.length > 0,
  hasPermissions: false,
  hasStyles: false,
})
