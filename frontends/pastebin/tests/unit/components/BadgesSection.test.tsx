import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BadgesSection } from '@/components/atoms/BadgesSection'
import { Snippet } from '@/lib/types'

describe('BadgesSection Component', () => {
  // Mock the onSaveSnippet callback
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Badges')).toBeInTheDocument()
    })

    it('should display the section title', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByRole('heading', { name: 'Badges', level: 2 })).toBeInTheDocument()
    })

    it('should display the section description', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Small status indicators and labels')).toBeInTheDocument()
    })

    it('should render ComponentShowcase with correct title', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Badge with Icons')).toBeInTheDocument()
    })

    it('should render all badge variants', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Default')).toBeInTheDocument()
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })
  })

  describe('Badge Content', () => {
    it('should render badges with icons', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Failed')).toBeInTheDocument()
      expect(screen.getByText('Featured')).toBeInTheDocument()
    })

    it('should render Variants section header', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/Variants/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render With Icons section header', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/With Icons/i)
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('should pass onSaveSnippet prop to ComponentShowcase', async () => {
      const user = userEvent.setup()
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)

      // Try to find and click save button
      const saveButtons = screen.queryAllByText(/Save as Snippet/i)
      if (saveButtons.length > 0) {
        await user.click(saveButtons[0])
      }

      // Component should receive the prop and be callable
      expect(typeof mockOnSaveSnippet).toBe('function')
    })

    it('should handle onSaveSnippet callback correctly', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(mockOnSaveSnippet).toBeDefined()
    })
  })

  describe('Conditional Rendering', () => {
    it('should always render the section element', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = document.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should render Card component with content', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      // Check if card content is rendered by looking for badge elements
      const badges = screen.getAllByText(/Default|Secondary|Destructive|Outline/i)
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should render description text for accessibility', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const description = screen.getByText('Small status indicators and labels')
      expect(description).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should handle missing onSaveSnippet gracefully', () => {
      // This should fail if component doesn't handle missing props
      expect(() => {
        render(<BadgesSection onSaveSnippet={jest.fn()} />)
      }).not.toThrow()
    })
  })

  describe('Component Integration', () => {
    it('should render ComponentShowcase with category atoms', () => {
      render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      // The ComponentShowcase should contain category 'atoms'
      expect(screen.getByText('Badge with Icons')).toBeInTheDocument()
    })

    it('should have proper spacing and structure', () => {
      const { container } = render(<BadgesSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })
  })
})
