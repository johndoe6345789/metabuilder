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

describe('PackagePage no-selection branch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "No Package Selected" and skips LevelGate when undefined', () => {
    navHook.useParams.mockReturnValue({})
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: null,
      loading: false,
    })
    render(<PackagePage />)
    expect(screen.getByText('No Package Selected')).toBeTruthy()
    expect(screen.queryByTestId('level-gate')).toBeNull()
  })

  it('shows "No Package Selected" when packageId is an empty string', () => {
    navHook.useParams.mockReturnValue({ packageId: '' })
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: null,
      loading: false,
    })
    render(<PackagePage />)
    expect(screen.getByText('No Package Selected')).toBeTruthy()
    expect(screen.queryByTestId('level-gate')).toBeNull()
  })

  it('wraps content in LevelGate with minLevel 1 and levelName User', () => {
    navHook.useParams.mockReturnValue({ packageId: 'my_pkg' })
    metadataHook.usePackageMetadata.mockReturnValue({
      metadata: makeMetadata(),
      loading: false,
    })
    render(<PackagePage />)
    expect(screen.getByTestId('level-gate')).toBeTruthy()
    expect(screen.getByTestId('level-gate-minlevel').textContent).toBe('1')
    expect(screen.getByTestId('level-gate-levelname').textContent).toBe(
      'User'
    )
  })
})
