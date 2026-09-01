import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PackageViewPlaceholder } from './PackageViewPlaceholder'
import type { PackageMetadata } from './use-package-metadata'

const baseMetadata: PackageMetadata = {
  packageId: 'forum',
  name: 'Forum',
  version: '2.1.0',
  description: 'Threaded community discussions.',
  dependencies: [],
  level: 3,
  category: 'engagement',
  icon: 'F',
}

describe('PackageViewPlaceholder', () => {
  it('renders the package name and packageId', () => {
    render(
      <PackageViewPlaceholder metadata={baseMetadata} packageId="forum" />
    )
    expect(
      screen.getByText('Package view for “Forum”')
    ).toBeTruthy()
    expect(screen.getByText(/packageId: .forum./)).toBeTruthy()
  })

  it('labels the dependency chip "Standalone" with no dependencies', () => {
    render(
      <PackageViewPlaceholder metadata={baseMetadata} packageId="forum" />
    )
    expect(screen.getByText('Standalone')).toBeTruthy()
  })

  it('labels the dependency chip "Dependency package" when deps exist', () => {
    const metadata: PackageMetadata = {
      ...baseMetadata,
      dependencies: ['core'],
    }
    render(<PackageViewPlaceholder metadata={metadata} packageId="forum" />)
    expect(screen.getByText('Dependency package')).toBeTruthy()
  })
})
