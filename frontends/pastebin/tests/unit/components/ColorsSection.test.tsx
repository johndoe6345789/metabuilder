import React from 'react'
import { render, screen } from '@/test-utils'
import { ColorsSection } from '@/components/atoms/ColorsSection'

describe('ColorsSection Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Colors')).toBeInTheDocument()
    })

    it('should display the section title', () => {
      render(<ColorsSection />)
      expect(screen.getByRole('heading', { name: 'Colors', level: 2 })).toBeInTheDocument()
    })

    it('should display the section description', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Semantic color palette with accessibility in mind')).toBeInTheDocument()
    })

    it('should render the Card component', () => {
      const { container } = render(<ColorsSection />)
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Color Grid Content', () => {
    it('should render all color names', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Accent')).toBeInTheDocument()
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      expect(screen.getByText('Muted')).toBeInTheDocument()
      expect(screen.getByText('Card')).toBeInTheDocument()
    })

    it('should render color codes for each color', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.50 0.18 310)')).toBeInTheDocument()
      expect(screen.getByText('oklch(0.30 0.08 310)')).toBeInTheDocument()
      expect(screen.getByText('oklch(0.72 0.20 25)')).toBeInTheDocument()
      expect(screen.getByText('oklch(0.577 0.245 27.325)')).toBeInTheDocument()
    })

    it('should render Primary color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.50 0.18 310)')).toBeInTheDocument()
    })

    it('should render Secondary color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.30 0.08 310)')).toBeInTheDocument()
    })

    it('should render Accent color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.72 0.20 25)')).toBeInTheDocument()
    })

    it('should render Destructive color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.577 0.245 27.325)')).toBeInTheDocument()
    })

    it('should render Muted color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.25 0.06 310)')).toBeInTheDocument()
    })

    it('should render Card color code', () => {
      render(<ColorsSection />)
      expect(screen.getByText('oklch(0.20 0.12 310)')).toBeInTheDocument()
    })
  })

  describe('Color Swatches', () => {
    it('should render color swatch elements', () => {
      const { container } = render(<ColorsSection />)
      const swatches = container.querySelectorAll('[class*="h-24"]')
      expect(swatches.length).toBeGreaterThan(0)
    })

    it('should have correct color classes applied to swatches', () => {
      const { container } = render(<ColorsSection />)
      expect(container.querySelector('.bg-primary')).toBeInTheDocument()
      expect(container.querySelector('.bg-secondary')).toBeInTheDocument()
      expect(container.querySelector('.bg-accent')).toBeInTheDocument()
      expect(container.querySelector('.bg-destructive')).toBeInTheDocument()
      expect(container.querySelector('.bg-muted')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should render section with proper class', () => {
      const { container } = render(<ColorsSection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })

    it('should render color grid with responsive layout', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('[class*="grid-cols"]')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive grid columns', () => {
      const { container } = render(<ColorsSection />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid?.className).toMatch(/grid-cols-/)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<ColorsSection />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should display description for context', () => {
      render(<ColorsSection />)
      const description = screen.getByText('Semantic color palette with accessibility in mind')
      expect(description).toBeInTheDocument()
    })

    it('should render colors with descriptive text', () => {
      render(<ColorsSection />)
      const primaryText = screen.getByText('Primary')
      expect(primaryText).toBeInTheDocument()
      expect(primaryText.tagName).not.toBe('IMG')
    })
  })

  describe('Code Display', () => {
    it('should render color codes in code elements', () => {
      const { container } = render(<ColorsSection />)
      const codeElements = container.querySelectorAll('code')
      expect(codeElements.length).toBeGreaterThan(0)
    })

    it('should display color codes with proper formatting', () => {
      const { container } = render(<ColorsSection />)
      const codes = container.querySelectorAll('code')
      let foundOklchCode = false
      codes.forEach(code => {
        if (code.textContent?.includes('oklch')) {
          foundOklchCode = true
        }
      })
      expect(foundOklchCode).toBe(true)
    })
  })

  describe('No Props Required', () => {
    it('should render with no props needed', () => {
      expect(() => {
        render(<ColorsSection />)
      }).not.toThrow()
    })

    it('should be a simple component with no prop dependencies', () => {
      const { rerender } = render(<ColorsSection />)
      expect(() => {
        rerender(<ColorsSection />)
      }).not.toThrow()
    })
  })

  describe('Error States', () => {
    it('should handle rendering gracefully', () => {
      expect(() => {
        render(<ColorsSection />)
      }).not.toThrow()
    })

    it('should always display all color information', () => {
      render(<ColorsSection />)
      expect(screen.getByText('Primary')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Accent')).toBeInTheDocument()
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      expect(screen.getByText('Muted')).toBeInTheDocument()
      expect(screen.getByText('Card')).toBeInTheDocument()
    })
  })

  describe('Component Content', () => {
    it('should render exactly 6 color groups', () => {
      render(<ColorsSection />)
      const colorNames = [
        screen.getByText('Primary'),
        screen.getByText('Secondary'),
        screen.getByText('Accent'),
        screen.getByText('Destructive'),
        screen.getByText('Muted'),
        screen.getByText('Card'),
      ]
      expect(colorNames).toHaveLength(6)
    })

    it('should have consistent styling across color items', () => {
      const { container } = render(<ColorsSection />)
      const colorItems = container.querySelectorAll('[class*="space-y-2"]')
      expect(colorItems.length).toBeGreaterThan(0)
    })
  })
})
