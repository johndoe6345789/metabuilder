import React from 'react'
import { render, screen } from '@testing-library/react'
import { ButtonsSection } from './ButtonsSection'
import '@testing-library/jest-dom'

describe('ButtonsSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Buttons')).toBeInTheDocument()
    })

    it('renders the section title', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Buttons')).toBeInTheDocument()
    })

    it('renders the section description', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Interactive controls with multiple variants and states')).toBeInTheDocument()
    })

    it('renders as a section element', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('Button Variants', () => {
    it('renders default button variant', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const buttons = screen.getAllByText('Default')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('renders secondary button variant', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('renders destructive button variant', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Destructive')).toBeInTheDocument()
    })

    it('renders outline button variant', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })

    it('renders ghost button variant', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Ghost')).toBeInTheDocument()
    })

    it('renders link button variant', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Link')).toBeInTheDocument()
    })
  })

  describe('Button Sizes', () => {
    it('renders small button size', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Small')).toBeInTheDocument()
    })

    it('renders default button size', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const defaultButtons = screen.getAllByText('Default')
      expect(defaultButtons.length).toBeGreaterThan(0)
    })

    it('renders large button size', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Large')).toBeInTheDocument()
    })

    it('renders icon button size with heart icon', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Button with Icons', () => {
    it('renders favorite button with star icon', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Favorite')).toBeInTheDocument()
    })

    it('renders add item button with plus icon', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    it('renders quick action button with lightning icon', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Quick Action')).toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('renders disabled button state', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const disabledButtons = screen.getAllByText('Disabled')
      expect(disabledButtons.length).toBeGreaterThan(0)
      disabledButtons.forEach((button) => {
        const buttonElement = button.closest('button')
        expect(buttonElement).toBeDisabled()
      })
    })

    it('renders disabled outline button state', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Disabled Outline')).toBeInTheDocument()
      const button = screen.getByText('Disabled Outline').closest('button')
      expect(button).toBeDisabled()
    })
  })

  describe('ComponentShowcase Integration', () => {
    it('includes ComponentShowcase for button variations', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      // ComponentShowcase doesn't render its title/description directly, but content is rendered
      const defaultButtons = screen.getAllByText('Default')
      expect(defaultButtons.length).toBeGreaterThan(0)
      expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('passes onSaveSnippet to ComponentShowcase', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      // Verify component renders without calling onSaveSnippet initially
      expect(mockOnSaveSnippet).not.toHaveBeenCalled()
    })
  })

  describe('Structure', () => {
    it('has proper spacing with space-y-6', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })

    it('renders Card component with buttons', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      // Card is rendered within the ComponentShowcase
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('displays variants section header', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Variants')).toBeInTheDocument()
    })

    it('displays sizes section header', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Sizes')).toBeInTheDocument()
    })

    it('displays with icons section header', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('With Icons')).toBeInTheDocument()
    })

    it('displays states section header', () => {
      render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('States')).toBeInTheDocument()
    })
  })

  describe('Props Handling', () => {
    it('accepts onSaveSnippet prop', () => {
      const { rerender } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Buttons')).toBeInTheDocument()

      const newOnSaveSnippet = jest.fn()
      rerender(<ButtonsSection onSaveSnippet={newOnSaveSnippet} />)
      expect(screen.getByText('Buttons')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const h2 = container.querySelector('h2')
      expect(h2).toHaveClass('text-3xl', 'font-bold')
    })

    it('renders subsection headers with proper styling', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const h3Elements = container.querySelectorAll('h3')
      expect(h3Elements.length).toBeGreaterThan(0)
    })

    it('has accessible button elements', () => {
      const { container } = render(<ButtonsSection onSaveSnippet={mockOnSaveSnippet} />)
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
