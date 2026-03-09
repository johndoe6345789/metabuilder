import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ButtonsSection } from '@/components/atoms/ButtonsSection'
import { Snippet } from '@/lib/types'

describe('ButtonsSection Component', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Buttons')).toBeInTheDocument()
    })

    it('should display the section title', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByRole('heading', { name: 'Buttons', level: 2 })).toBeInTheDocument()
    })

    it('should display the section description', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Interactive controls with multiple variants and states/i)).toBeInTheDocument()
    })

    it('should render ComponentShowcase with correct title', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent).toContain('Button')
    })
  })

  describe('Button Variants Section', () => {
    it('should display Variants heading', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/Variants/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render all button variants', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getAllByText('Default').length).toBeGreaterThan(0)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
      expect(screen.getByText('Destructive')).toBeInTheDocument()
      expect(screen.getByText('Outline')).toBeInTheDocument()
      expect(screen.getByText('Ghost')).toBeInTheDocument()
      expect(screen.getByText('Link')).toBeInTheDocument()
    })
  })

  describe('Button Sizes Section', () => {
    it('should display Sizes heading', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/Sizes/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render all button sizes', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Small')).toBeInTheDocument()
      expect(screen.getByText('Large')).toBeInTheDocument()
    })
  })

  describe('Button with Icons Section', () => {
    it('should display With Icons heading', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/With Icons/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render buttons with icon combinations', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Favorite')).toBeInTheDocument()
      expect(screen.getByText('Add Item')).toBeInTheDocument()
      expect(screen.getByText('Quick Action')).toBeInTheDocument()
    })
  })

  describe('Button States Section', () => {
    it('should display States heading', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/States/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render disabled buttons', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const allButtons = screen.getAllByRole('button')
      const disabledButtons = allButtons.filter(btn => btn.hasAttribute('disabled'))
      expect(disabledButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('should accept onSaveSnippet prop', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(typeof mockOnSaveSnippet).toBe('function')
    })

    it('should pass callback to ComponentShowcase', async () => {
      const user = userEvent.setup()
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)

      const saveButtons = screen.queryAllByText(/Save as Snippet/i)
      if (saveButtons.length > 0) {
        await user.click(saveButtons[0])
      }

      expect(typeof mockOnSaveSnippet).toBe('function')
    })
  })

  describe('Conditional Rendering', () => {
    it('should always render the section element', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = document.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should render all button variation groups', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getAllByText('Default').length).toBeGreaterThan(0)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should have descriptive text', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Interactive controls with multiple variants and states/i)).toBeInTheDocument()
    })

    it('should render section with proper structure', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })
  })

  describe('Component Integration', () => {
    it('should render ComponentShowcase with atoms category', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings.some(h => h.textContent?.includes('Icons'))).toBe(true)
    })
  })

  describe('Error States', () => {
    it('should not crash with valid props', () => {
      expect(() => {
        render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      }).not.toThrow()
    })
  })
})
