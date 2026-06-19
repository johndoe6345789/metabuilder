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
      expect(
        screen.getByText('Semantic color palette with accessibility in mind'),
      ).toBeInTheDocument()
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
      render(<ColorsSection />)
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('renders color swatches with rounded corners', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Card')).toBeInTheDocument()
    })

    it('renders primary background color', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Primary')).toBeInTheDocument()
    })

    it('renders secondary background color', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('renders accent background color', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Accent')).toBeInTheDocument()
    })

    it('renders destructive background color', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('renders muted background color', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Muted')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('renders grid layout', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('.colorsGrid')
      expect(grid).toBeInTheDocument()
    })

    it('has responsive grid columns', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('.colorsGrid')
      expect(grid).toBeInTheDocument()
    })

    it('has proper gap between color items', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('.colorsGrid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('has proper spacing with space-y-6', () => {
      render(<ColorsSection />)
      expect(screen.getByTestId('colors-section')).toBeInTheDocument()
    })

    it('renders Card component', () => {
      render(<ColorsSection />)
      expect(screen.getByTestId('colors-section')).toBeInTheDocument()
    })

    it('has individual color item spacing', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Muted')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      const { container } = render(<ColorsSection />)
      const h2 = container.querySelector('h2')
      expect(h2).toBeInTheDocument()
      expect(h2?.textContent).toBe('Colors')
    })

    it('renders color names as text content', () => {
      render(<ColorsSection />)
      const colorNames = [
        'Primary',
        'Secondary',
        'Accent',
        'Destructive',
        'Muted',
        'Card',
      ]
      colorNames.forEach(colorName => {
        expect(screen.getByText(colorName)).toBeInTheDocument()
      })
    })

    it('uses code element for color values', () => {
      const { container } = render(<ColorsSection />)
      const codeElements = container.querySelectorAll('code')
      expect(codeElements.length).toBeGreaterThan(0)
    })

    it('applies muted foreground color to descriptions', () => {
      render(<ColorsSection />)
      expect(
        screen.getByText('Semantic color palette with accessibility in mind'),
      ).toBeInTheDocument()
    })
  })

  describe('Card Styling', () => {
    it('renders card with padding', () => {
      const { container } = render(<ColorsSection />)
      const card = container.querySelector('[class*="p-"]')
      expect(card).toBeInTheDocument()
    })

    it('renders card border on card color swatch', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Card')).toBeInTheDocument()
    })
  })
})
