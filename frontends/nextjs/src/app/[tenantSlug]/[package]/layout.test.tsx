import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const navigation = vi.hoisted(() => ({
  useParams: vi.fn(() => ({ tenantSlug: 'acme', package: 'blog' })),
}))
vi.mock('next/navigation', () => navigation)

import TenantLayout from './layout'
import { useTenant } from './tenant-context'

function TenantConsumer() {
  const tenant = useTenant()
  return <div data-testid="ctx">{`${tenant.tenant}/${tenant.primaryPackage}`}</div>
}

describe('TenantLayout', () => {
  it('provides tenant context from the route params', () => {
    render(
      <TenantLayout>
        <TenantConsumer />
      </TenantLayout>
    )
    expect(screen.getByTestId('ctx').textContent).toBe('acme/blog')
  })

  it('sets tenant and package data attributes on the wrapper', () => {
    const { container } = render(
      <TenantLayout>
        <div>content</div>
      </TenantLayout>
    )
    const wrapper = container.querySelector('.tenant-layout')
    expect(wrapper?.getAttribute('data-tenant')).toBe('acme')
    expect(wrapper?.getAttribute('data-package')).toBe('blog')
  })
})
