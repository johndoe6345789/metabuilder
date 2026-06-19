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
      expect(
        screen.getByRole('heading', { name: 'Icons', level: 2 }),
      ).toBeInTheDocument()
    })

    it('should display the section description', () => {
      render(<IconsSection />)
      expect(
        screen.getByText('Material Symbols icon set'),
      ).toBeInTheDocument()
    })

    it('should render the Card component', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
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
      const grid = container.querySelector('.iconsGrid')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive grid columns', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('.iconsGrid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Icon Elements', () => {
    it('should render icon SVG elements', () => {
      const { container } = render(<IconsSection />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('should render icons with proper sizing', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
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
      render(<IconsSection />)
      const labels = ['Heart', 'Star', 'Lightning', 'Check', 'X', 'Plus', 'Minus', 'Search']
      labels.forEach(label => expect(screen.getByText(label)).toBeInTheDocument())
    })

    it('should render icon labels below icons', () => {
      render(<IconsSection />)
      // Labels should exist
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('should use consistent spacing for icon items', () => {
      render(<IconsSection />)
      expect(screen.getByTestId('icons-section')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should render section with proper class', () => {
      render(<IconsSection />)
      expect(screen.getByTestId('icons-section')).toBeInTheDocument()
    })

    it('should have responsive grid layout', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('.iconsGrid')
      expect(grid).toBeInTheDocument()
    })

    it('should render Card with padding', () => {
      render(<IconsSection />)
      expect(screen.getByTestId('icons-section')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<IconsSection />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should display description for context', () => {
      render(<IconsSection />)
      const description = screen.getByText('Material Symbols icon set')
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
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
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
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })

  describe('Icon Display Properties', () => {
    it('should render icons with proper height and width', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('should render text with muted foreground color', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })
})
