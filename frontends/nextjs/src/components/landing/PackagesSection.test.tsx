import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PackagesSection } from './PackagesSection'
import { PRODUCT_PACKAGES } from '@/lib/packages/product-packages'

describe('PackagesSection', () => {
  it('renders the section heading', () => {
    render(<PackagesSection />)
    expect(
      screen.getByText('Everything your community needs')
    ).toBeTruthy()
  })

  it('renders a card for every product package', () => {
    render(<PackagesSection />)
    expect(PRODUCT_PACKAGES.length).toBeGreaterThan(0)
    for (const pkg of PRODUCT_PACKAGES) {
      expect(screen.getByText(pkg.name)).toBeTruthy()
      expect(screen.getByText(pkg.tagline)).toBeTruthy()
    }
  })

  it('renders every feature of the first package as a list item', () => {
    render(<PackagesSection />)
    const first = PRODUCT_PACKAGES[0]
    for (const feature of first.features) {
      expect(screen.getByText(feature)).toBeTruthy()
    }
  })
})
