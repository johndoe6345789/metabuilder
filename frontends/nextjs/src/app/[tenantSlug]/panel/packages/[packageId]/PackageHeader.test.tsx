import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PackageHeader } from './PackageHeader'
import type { PackageMetadata } from './use-package-metadata'

const metadata: PackageMetadata = {
  packageId: 'forum',
  name: 'Forum',
  version: '2.1.0',
  description: 'Threaded community discussions.',
  dependencies: [],
  level: 3,
  category: 'engagement',
  icon: 'F',
}

describe('PackageHeader', () => {
  it('renders the package name, description and icon', () => {
    render(<PackageHeader metadata={metadata} />)
    expect(screen.getByText('Forum')).toBeTruthy()
    expect(
      screen.getByText('Threaded community discussions.')
    ).toBeTruthy()
    expect(screen.getByText('F')).toBeTruthy()
  })

  it('renders a chip for the version, category and level', () => {
    render(<PackageHeader metadata={metadata} />)
    expect(screen.getByText('v2.1.0')).toBeTruthy()
    expect(screen.getByText('engagement')).toBeTruthy()
    expect(screen.getByText('Level 3')).toBeTruthy()
  })
})
