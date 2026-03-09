import React from 'react'
import { render, screen } from '@testing-library/react'
import { ColorsSection } from './ColorsSection'
import '@testing-library/jest-dom'

describe('ColorsSection', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Colors')).toBeInTheDocument()
    })

    it('renders the section title', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Colors')).toBeInTheDocument()
    })

    it('renders the section description', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Semantic color palette with accessibility in mind')).toBeInTheDocument()
    })

    it('renders as a section element', () => {
      const { container } = render(<ColorsSection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('Color Swatches', () => {
    it('renders primary color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Primary')).toBeInTheDocument()
    })

    it('renders secondary color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('renders accent color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Accent')).toBeInTheDocument()
    })

    it('renders destructive color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('renders muted color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Muted')).toBeInTheDocument()
    })

    it('renders card color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Card')).toBeInTheDocument()
    })
  })

  describe('Color Codes', () => {
    it('displays primary color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.50 0.18 310)')).toBeInTheDocument()
    })

    it('displays secondary color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.30 0.08 310)')).toBeInTheDocument()
    })

    it('displays accent color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.72 0.20 25)')).toBeInTheDocument()
    })

    it('displays destructive color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.577 0.245 27.325)')).toBeInTheDocument()
    })

    it('displays muted color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.25 0.06 310)')).toBeInTheDocument()
    })

    it('displays card color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.20 0.12 310)')).toBeInTheDocument()
    })
  })

  describe('Color Swatches Styling', () => {
    it('renders color swatch with appropriate height', () => {
      const { container } = render(<ColorsSection />)
      const swatches = container.querySelectorAll('[class*="h-24"]')
      expect(swatches.length).toBeGreaterThan(0)
    })

    it('renders color swatches with rounded corners', () => {
      const { container } = render(<ColorsSection />)
      const swatches = container.querySelectorAll('[class*="rounded"]')
      expect(swatches.length).toBeGreaterThan(0)
    })

    it('renders primary background color', () => {
      const { container } = render(<ColorsSection />)
      const primarySwatch = container.querySelector('[class*="bg-primary"]')
      expect(primarySwatch).toBeInTheDocument()
    })

    it('renders secondary background color', () => {
      const { container } = render(<ColorsSection />)
      const secondarySwatch = container.querySelector('[class*="bg-secondary"]')
      expect(secondarySwatch).toBeInTheDocument()
    })

    it('renders accent background color', () => {
      const { container } = render(<ColorsSection />)
      const accentSwatch = container.querySelector('[class*="bg-accent"]')
      expect(accentSwatch).toBeInTheDocument()
    })

    it('renders destructive background color', () => {
      const { container } = render(<ColorsSection />)
      const destructiveSwatch = container.querySelector('[class*="bg-destructive"]')
      expect(destructiveSwatch).toBeInTheDocument()
    })

    it('renders muted background color', () => {
      const { container } = render(<ColorsSection />)
      const mutedSwatch = container.querySelector('[class*="bg-muted"]')
      expect(mutedSwatch).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('renders grid layout', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('has responsive grid columns', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3')
    })

    it('has proper gap between color items', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('[class*="gap-6"]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('has proper spacing with space-y-6', () => {
      const { container } = render(<ColorsSection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })

    it('renders Card component', () => {
      const { container } = render(<ColorsSection />)
      const card = container.querySelector('[class*="p-6"]')
      expect(card).toBeInTheDocument()
    })

    it('has individual color item spacing', () => {
      const { container } = render(<ColorsSection />)
      const colorItems = container.querySelectorAll('[class*="space-y-2"]')
      expect(colorItems.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      const { container } = render(<ColorsSection />)
      const h2 = container.querySelector('h2')
      expect(h2).toHaveClass('text-3xl', 'font-bold')
    })

    it('renders color names as text content', () => {
      render(<ColorsSection />)
      const colorNames = ['Primary', 'Secondary', 'Accent', 'Destructive', 'Muted', 'Card']
      colorNames.forEach((colorName) => {
        expect(screen.getByText(colorName)).toBeInTheDocument()
      })
    })

    it('uses code element for color values', () => {
      const { container } = render(<ColorsSection />)
      const codeElements = container.querySelectorAll('code')
      expect(codeElements.length).toBeGreaterThan(0)
    })

    it('applies muted foreground color to descriptions', () => {
      const { container } = render(<ColorsSection />)
      const mutedElements = container.querySelectorAll('[class*="text-muted-foreground"]')
      expect(mutedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Card Styling', () => {
    it('renders card with padding', () => {
      const { container } = render(<ColorsSection />)
      const card = container.querySelector('[class*="p-6"]')
      expect(card).toHaveClass('p-6')
    })

    it('renders card border on card color swatch', () => {
      const { container } = render(<ColorsSection />)
      const cardSwatch = container.querySelector('[class*="border-border"]')
      expect(cardSwatch).toBeInTheDocument()
    })
  })
})
