import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PRODUCT_TIERS } from '@/lib/packages/product-packages'
import { PricingSection } from './PricingSection'

describe('PricingSection', () => {
  it('renders every tier by name and cta', () => {
    render(<PricingSection />)
    for (const t of PRODUCT_TIERS) {
      expect(screen.getByText(t.name)).toBeTruthy()
      expect(screen.getAllByText(t.cta).length).toBeGreaterThan(0)
    }
  })

  it('shows a "Most popular" pill only on the highlighted tier', () => {
    render(<PricingSection />)
    const highlighted = PRODUCT_TIERS.filter(t => t.highlight)
    expect(screen.getAllByText('Most popular')).toHaveLength(
      highlighted.length
    )
  })

  it('shows a member limit for a capped tier and "Unlimited" for an uncapped one', () => {
    render(<PricingSection />)
    const capped = PRODUCT_TIERS.find(t => t.memberLimit !== null)
    const uncapped = PRODUCT_TIERS.find(t => t.memberLimit === null)
    if (capped?.memberLimit != null) {
      expect(
        screen.getByText(
          `Up to ${capped.memberLimit.toLocaleString()} members`
        )
      ).toBeTruthy()
    }
    if (uncapped !== undefined) {
      expect(screen.getByText('Unlimited members')).toBeTruthy()
    }
  })

  it('links every CTA to the signup page', () => {
    render(<PricingSection />)
    const links = screen.getAllByText(PRODUCT_TIERS[0].cta)
    for (const link of links) {
      expect(link.getAttribute('href')).toBe('/ui/signup')
    }
  })
})
