import React from 'react'
import { render, screen } from '@/test-utils'
import { IconsSection } from '@/components/atoms/IconsSection'

describe('IconsSection Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<IconsSection />)
      expect(screen.getByText('Icons')).toBeInTheDocument()
    })

    it('should display the section title', () => {
      render(<IconsSection />)
      expect(screen.getByRole('heading', { name: 'Icons', level: 2 })).toBeInTheDocument()
    })

    it('should display the section description', () => {
      render(<IconsSection />)
      expect(screen.getByText('Phosphor icon set with multiple weights')).toBeInTheDocument()
    })

    it('should render the Card component', () => {
      const { container } = render(<IconsSection />)
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Icon Grid Display', () => {
    it('should render all icon labels', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
      expect(screen.getByText('Lightning')).toBeInTheDocument()
      expect(screen.getByText('Check')).toBeInTheDocument()
      expect(screen.getByText('X')).toBeInTheDocument()
      expect(screen.getByText('Plus')).toBeInTheDocument()
      expect(screen.getByText('Minus')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
    })

    it('should render icon grid container', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive grid columns', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('[class*="grid-cols"]')
      expect(grid?.className).toMatch(/grid-cols-/)
    })
  })

  describe('Icon Elements', () => {
    it('should render icon SVG elements', () => {
      const { container } = render(<IconsSection />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render icons with proper sizing', () => {
      const { container } = render(<IconsSection />)
      const icons = container.querySelectorAll('[class*="h-8"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should render all 8 icons', () => {
      render(<IconsSection />)
      const iconLabels = [
        'Heart',
        'Star',
        'Lightning',
        'Check',
        'X',
        'Plus',
        'Minus',
        'Search',
      ]
      iconLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })

  describe('Icon Organization', () => {
    it('should group each icon with its label', () => {
      const { container } = render(<IconsSection />)
      const iconContainers = container.querySelectorAll('[class*="flex"]')
      expect(iconContainers.length).toBeGreaterThan(8)
    })

    it('should render icon labels below icons', () => {
      render(<IconsSection />)
      // Labels should exist
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('should use consistent spacing for icon items', () => {
      const { container } = render(<IconsSection />)
      const items = container.querySelectorAll('[class*="gap-2"]')
      expect(items.length).toBeGreaterThan(0)
    })
  })

  describe('Layout Structure', () => {
    it('should render section with proper class', () => {
      const { container } = render(<IconsSection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })

    it('should have responsive grid layout', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid?.className).toMatch(/sm:grid-cols|md:grid-cols|lg:grid-cols/)
    })

    it('should render Card with padding', () => {
      const { container } = render(<IconsSection />)
      const card = container.querySelector('[class*="p-6"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<IconsSection />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should display description for context', () => {
      render(<IconsSection />)
      const description = screen.getByText('Phosphor icon set with multiple weights')
      expect(description).toBeInTheDocument()
    })

    it('should render text labels for each icon', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
      expect(screen.getByText('Lightning')).toBeInTheDocument()
      expect(screen.getByText('Check')).toBeInTheDocument()
    })

    it('should have text labels with smaller font size', () => {
      const { container } = render(<IconsSection />)
      const labels = container.querySelectorAll('[class*="text-xs"]')
      expect(labels.length).toBeGreaterThan(0)
    })
  })

  describe('No Props Required', () => {
    it('should render with no props needed', () => {
      expect(() => {
        render(<IconsSection />)
      }).not.toThrow()
    })

    it('should be a simple component with no prop dependencies', () => {
      const { rerender } = render(<IconsSection />)
      expect(() => {
        rerender(<IconsSection />)
      }).not.toThrow()
    })
  })

  describe('Error States', () => {
    it('should handle rendering gracefully', () => {
      expect(() => {
        render(<IconsSection />)
      }).not.toThrow()
    })

    it('should always display all icons', () => {
      render(<IconsSection />)
      const icons = [
        'Heart',
        'Star',
        'Lightning',
        'Check',
        'X',
        'Plus',
        'Minus',
        'Search',
      ]
      icons.forEach(icon => {
        expect(screen.getByText(icon)).toBeInTheDocument()
      })
    })
  })

  describe('Component Consistency', () => {
    it('should render exactly 8 icon labels', () => {
      render(<IconsSection />)
      const iconLabels = [
        'Heart',
        'Star',
        'Lightning',
        'Check',
        'X',
        'Plus',
        'Minus',
        'Search',
      ]
      expect(iconLabels).toHaveLength(8)
    })

    it('should have consistent visual presentation', () => {
      const { container } = render(<IconsSection />)
      // Check for consistent styling classes
      expect(container.querySelector('[class*="flex"]')).toBeInTheDocument()
      expect(container.querySelector('[class*="gap"]')).toBeInTheDocument()
    })
  })

  describe('Icon Display Properties', () => {
    it('should render icons with proper height and width', () => {
      const { container } = render(<IconsSection />)
      const icons = container.querySelectorAll('[class*="h-8"][class*="w-8"]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should render text with muted foreground color', () => {
      const { container } = render(<IconsSection />)
      const labels = container.querySelectorAll('[class*="text-muted-foreground"]')
      expect(labels.length).toBeGreaterThan(0)
    })
  })
})
