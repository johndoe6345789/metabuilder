import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  navHook,
  metadataHook,
  mockLevelGate,
  mockPackageHeader,
  mockPackageDependencies,
  mockPackageViewPlaceholder,
  makeMetadata,
} from './package-page-test-mocks'

vi.mock('next/navigation', () => navHook)
vi.mock('./use-package-metadata', () => metadataHook)
vi.mock('@/components/layout/LevelGate', () => ({
  LevelGate: mockLevelGate,
}))
vi.mock('./PackageHeader', () => ({ PackageHeader: mockPackageHeader }))
vi.mock('./PackageDependencies', () => ({
  PackageDependencies: mockPackageDependencies,
}))
vi.mock('./PackageViewPlaceholder', () => ({
  PackageViewPlaceholder: mockPackageViewPlaceholder,
}))

import PackagePage from './page'

// Split out of page.test.tsx (which covers the no-selection branch) to
// stay under the 80-line file limit.
describe('PackagePage content branches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading message while metadata is loading', () => {
    navHook.useParams.mockReturnValue({ packageId: 'my_pkg' })
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: null,
      loading: true,
    })
    render(<PackagePage />)
    expect(screen.getByText('Loading package...')).toBeTruthy()
    expect(screen.queryByTestId('package-header')).toBeNull()
  })

  it('shows a not-found panel naming the packageId when metadata is null', () => {
    navHook.useParams.mockReturnValue({ packageId: 'ghost_pkg' })
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: null,
      loading: false,
    })
    render(<PackagePage />)
    expect(screen.getByText('Package Not Found')).toBeTruthy()
    expect(screen.getByText(/ghost_pkg/)).toBeTruthy()
  })

  it('threads metadata and packageId into the three content children', () => {
    navHook.useParams.mockReturnValue({ packageId: 'my_pkg' })
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: makeMetadata({ name: 'My Pkg', dependencies: ['x', 'y'] }),
      loading: false,
    })
    render(<PackagePage />)
    expect(screen.getByTestId('package-header').textContent).toBe('My Pkg')
    expect(screen.getByTestId('package-dependencies').textContent).toBe(
      'x,y'
    )
    expect(
      screen.getByTestId('package-view-placeholder').textContent
    ).toBe('my_pkg:My Pkg')
  })

  it('passes the URL packageId, not the metadata one, to the hook', () => {
    navHook.useParams.mockReturnValue({ packageId: 'from-url' })
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: makeMetadata({ packageId: 'from-metadata' }),
      loading: false,
    })
    render(<PackagePage />)
    expect(metadataHook.usePackageMetadata).toHaveBeenCalledWith(
      'from-url'
    )
  })
})
