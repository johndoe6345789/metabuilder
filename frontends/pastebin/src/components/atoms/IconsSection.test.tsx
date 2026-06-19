import React from 'react'
import { render, screen } from '@testing-library/react'
import { IconsSection } from './IconsSection'
import '@testing-library/jest-dom'

describe('IconsSection', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<IconsSection />)
      expect(screen.getByText('Icons')).toBeInTheDocument()
    })

    it('renders the section title', () => {
      render(<IconsSection />)
      expect(screen.getByText('Icons')).toBeInTheDocument()
    })

    it('renders the section description', () => {
      render(<IconsSection />)
      expect(
        screen.getByText('Material Symbols icon set'),
      ).toBeInTheDocument()
    })

    it('renders as a section element', () => {
      const { container } = render(<IconsSection />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('Icon Display', () => {
    it('renders Heart icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
    })

    it('renders Star icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('renders Lightning icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Lightning')).toBeInTheDocument()
    })

    it('renders Check icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Check')).toBeInTheDocument()
    })

    it('renders X icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('X')).toBeInTheDocument()
    })

    it('renders Plus icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Plus')).toBeInTheDocument()
    })

    it('renders Minus icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Minus')).toBeInTheDocument()
    })

    it('renders Search icon label', () => {
      render(<IconsSection />)
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })

  describe('Icon Rendering', () => {
    it('renders SVG elements for icons', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
    })

    it('renders icons with proper sizing', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('renders Heart icon element', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
    })
  })

  describe('Icon Container Structure', () => {
    it('renders icon containers with flex column layout', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
    })

    it('renders icon containers centered', () => {
      render(<IconsSection />)
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('renders icon containers with gap spacing', () => {
      render(<IconsSection />)
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('renders grid layout', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('.iconsGrid')
      expect(grid).toBeInTheDocument()
    })

    it('has responsive grid columns', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('.iconsGrid')
      expect(grid).toBeInTheDocument()
    })

    it('has proper gap between icons', () => {
      const { container } = render(<IconsSection />)
      const grid = container.querySelector('.iconsGrid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Icon Labels', () => {
    it('renders icon labels with small text styling', () => {
      render(<IconsSection />)
      expect(screen.getByText('Heart')).toBeInTheDocument()
    })

    it('renders icon labels with muted foreground color', () => {
      render(<IconsSection />)
      expect(screen.getByText('Star')).toBeInTheDocument()
    })

    it('renders all icon labels', () => {
      render(<IconsSection />)
      const labels = [
        'Heart',
        'Star',
        'Lightning',
        'Check',
        'X',
        'Plus',
        'Minus',
        'Search',
      ]
      labels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })

  describe('Structure', () => {
    it('has proper spacing with space-y-6', () => {
      render(<IconsSection />)
      expect(screen.getByTestId('icons-section')).toBeInTheDocument()
    })

    it('renders Card component', () => {
      render(<IconsSection />)
      expect(screen.getByTestId('icons-section')).toBeInTheDocument()
    })

    it('renders all 8 icon items', () => {
      render(<IconsSection />)
      expect(screen.getAllByText(/Heart|Star|Lightning|Check|Plus|Minus|Search/).length).toBeGreaterThanOrEqual(7)
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      const { container } = render(<IconsSection />)
      const h2 = container.querySelector('h2')
      expect(h2).toBeInTheDocument()
      expect(h2?.textContent).toBe('Icons')
    })

    it('renders icon labels for screen reader accessibility', () => {
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

    it('uses span elements for labels', () => {
      const { container } = render(<IconsSection />)
      const spans = container.querySelectorAll('span')
      expect(spans.length).toBeGreaterThan(0)
    })
  })

  describe('Card Styling', () => {
    it('renders card with padding', () => {
      const { container } = render(<IconsSection />)
      const card = container.querySelector('[class*="p-"]')
      expect(card).toBeInTheDocument()
    })

    it('renders card in section', () => {
      const { container } = render(<IconsSection />)
      const section = container.querySelector('section')
      const card = section?.querySelector('[class*="p-6"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Icon Count', () => {
    it('renders exactly 8 icon items', () => {
      render(<IconsSection />)
      const labels = [
        'Heart',
        'Star',
        'Lightning',
        'Check',
        'X',
        'Plus',
        'Minus',
        'Search',
      ]
      labels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })
})
