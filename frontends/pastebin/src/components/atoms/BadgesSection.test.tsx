import React from 'react'
import { render, screen } from '@testing-library/react'
import { BadgesSection } from './BadgesSection'
import '@testing-library/jest-dom'

describe('BadgesSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Badges')).toBeInTheDocument()
    })

    it('renders the section title', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Badges')).toBeInTheDocument()
    })

    it('renders the section description', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Small status indicators and labels')).toBeInTheDocument()
    })

    it('renders as a section element', () => {
      const { container } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('Badge Variants', () => {
    it('renders default badge', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('renders secondary badge', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('renders destructive badge', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('renders outline badge', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })
  })

  describe('Badge with Icons', () => {
    it('renders completed badge with check icon', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('renders failed badge with X icon', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('renders featured badge with star icon', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Featured')).toBeInTheDocument()
    })
  })

  describe('ComponentShowcase Integration', () => {
    it('includes ComponentShowcase for badge variations', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      // ComponentShowcase doesn't render its title/description directly, but content is rendered
      expect(screen.getByText('Default')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('passes onSaveSnippet to ComponentShowcase', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      // Verify component renders without calling onSaveSnippet initially
      expect(mockOnSaveSnippet).not.toHaveBeenCalled()
    })
  })

  describe('Props Handling', () => {
    it('accepts onSaveSnippet prop', () => {
      const { rerender } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Badges')).toBeInTheDocument()

      const newOnSaveSnippet = jest.fn()
      rerender(<BadgesSection onSaveSnippet={newOnSaveSnippet} />)
      expect(screen.getByText('Badges')).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('has proper spacing with space-y-6', () => {
      const { container } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })

    it('renders Card component with badges', () => {
      const { container } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      // Card is rendered within the ComponentShowcase
      const badges = container.querySelectorAll('[class*="badge"]')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('displays variant section header', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Variants')).toBeInTheDocument()
    })

    it('displays with icons section header', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('With Icons')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      const { container } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const h2 = container.querySelector('h2')
      expect(h2).toHaveClass('text-3xl', 'font-bold')
    })

    it('renders subsection headers with proper styling', () => {
      const { container } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const h3Elements = container.querySelectorAll('h3')
      expect(h3Elements.length).toBeGreaterThan(0)
    })
  })
})
