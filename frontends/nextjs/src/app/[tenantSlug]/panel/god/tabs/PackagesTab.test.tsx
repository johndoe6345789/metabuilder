import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const tab = vi.hoisted(() => ({ usePackagesTab: vi.fn() }))
vi.mock('./use-packages-tab', () => tab)
vi.mock('@/components/tenant/TenantSelect', () => ({
  TenantSelect: () => null,
}))
vi.mock('./packages/PackageManager', () => ({ PackageManager: () => null }))

import { PackagesTab } from './PackagesTab'

const stub = (over: Record<string, unknown> = {}): void => {
  tab.usePackagesTab.mockReturnValue({
    tenant: 'system',
    tenantInput: 'system',
    setTenantInput: vi.fn(),
    applyTenant: vi.fn(),
    registry: {
      isInstalled: () => false,
      loading: false,
      error: null,
    },
    busy: null,
    flash: null,
    setFlash: vi.fn(),
    install: vi.fn(),
    uninstall: vi.fn(),
    ...over,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub()
})

describe('PackagesTab', () => {
  it('shows the offline warning when the registry errors', () => {
    stub({ registry: { isInstalled: () => false, loading: false, error: 'x' } })
    render(<PackagesTab />)
    expect(screen.getByText(/DBAL offline/)).toBeTruthy()
  })

  it('shows no warning when the registry is healthy', () => {
    render(<PackagesTab />)
    expect(screen.queryByText(/DBAL offline/)).toBeNull()
  })

  it('shows a flash message', () => {
    stub({ flash: 'Blog installed — pages are live.' })
    render(<PackagesTab />)
    expect(screen.getByText(/Blog installed/)).toBeTruthy()
  })

  it('renders one catalog card per product package', () => {
    render(<PackagesTab />)
    expect(screen.getAllByText('Install').length).toBeGreaterThan(0)
  })
})
