import React from 'react'
import { render, screen } from '@testing-library/react'
import { InputsSection } from './InputsSection'
import '@testing-library/jest-dom'

describe('InputsSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Inputs')).toBeInTheDocument()
    })

    it('renders the section title', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Inputs')).toBeInTheDocument()
    })

    it('renders the section description', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Form input fields for user data entry')).toBeInTheDocument()
    })

    it('renders as a section element', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(container.querySelector('section')).toBeInTheDocument()
    })
  })

  describe('Input States', () => {
    it('renders default input placeholder', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByPlaceholderText('Default input')).toBeInTheDocument()
    })

    it('renders disabled input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const disabledInput = screen.getByPlaceholderText('Disabled input')
      expect(disabledInput).toBeDisabled()
    })

    it('renders search input with icon', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('renders default input as enabled', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const defaultInput = screen.getByPlaceholderText('Default input')
      expect(defaultInput).not.toBeDisabled()
    })
  })

  describe('Input Types', () => {
    it('renders text input type', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const textInput = screen.getByPlaceholderText('Text input') as HTMLInputElement
      expect(textInput.type).toBe('text')
    })

    it('renders email input type', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const emailInput = screen.getByPlaceholderText('email@example.com') as HTMLInputElement
      expect(emailInput.type).toBe('email')
    })

    it('renders password input type', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
      expect(passwordInput.type).toBe('password')
    })

    it('renders number input type', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const numberInput = screen.getByPlaceholderText('123') as HTMLInputElement
      expect(numberInput.type).toBe('number')
    })
  })

  describe('Search Input with Icon', () => {
    it('renders search input with icon container', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const iconContainer = container.querySelector('[class*="relative"]')
      expect(iconContainer).toBeInTheDocument()
    })

    it('renders search input with search icon', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('renders search input with proper left padding for icon', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).toHaveClass('pl-10')
    })
  })

  describe('Input Placeholders', () => {
    it('renders all input placeholders', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByPlaceholderText('Default input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Disabled input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Text input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('123')).toBeInTheDocument()
    })
  })

  describe('ComponentShowcase Integration', () => {
    it('includes ComponentShowcase for input variations', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      // Verify inputs are rendered
      expect(screen.getByPlaceholderText('Default input')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('passes onSaveSnippet to ComponentShowcase', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      // Verify component renders without calling onSaveSnippet initially
      expect(mockOnSaveSnippet).not.toHaveBeenCalled()
    })
  })

  describe('Structure', () => {
    it('has proper spacing with space-y-6', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })

    it('renders Card component with inputs', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      // Card is rendered within the ComponentShowcase
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('displays states section header', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('States')).toBeInTheDocument()
    })

    it('displays types section header', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Types')).toBeInTheDocument()
    })

    it('has input containers with max-width', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const maxWidthContainers = container.querySelectorAll('[class*="max-w-md"]')
      expect(maxWidthContainers.length).toBeGreaterThan(0)
    })
  })

  describe('Input Spacing', () => {
    it('has proper spacing between inputs', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const spacedContainers = container.querySelectorAll('[class*="space-y-4"]')
      expect(spacedContainers.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('accepts onSaveSnippet prop', () => {
      const { rerender } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Inputs')).toBeInTheDocument()

      const newOnSaveSnippet = jest.fn()
      rerender(<InputsSection onSaveSnippet={newOnSaveSnippet} />)
      expect(screen.getByText('Inputs')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic heading structure', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const h2 = container.querySelector('h2')
      expect(h2).toHaveClass('text-3xl', 'font-bold')
    })

    it('renders subsection headers with proper styling', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const h3Elements = container.querySelectorAll('h3')
      expect(h3Elements.length).toBeGreaterThan(0)
    })

    it('has accessible input elements', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('renders input with proper labels via placeholders', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Input Attributes', () => {
    it('search input is not disabled', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const searchInput = screen.getByPlaceholderText('Search...')
      expect(searchInput).not.toBeDisabled()
    })

    it('all type inputs are present', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(7)
    })
  })

  describe('Icon in Search Field', () => {
    it('renders magnifying glass icon in search field', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const absoluteIcon = container.querySelector('[class*="absolute"]')
      expect(absoluteIcon).toBeInTheDocument()
    })

    it('icon has proper positioning class', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const icon = container.querySelector('[class*="left-3"]')
      expect(icon).toBeInTheDocument()
    })

    it('icon is vertically centered', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const icon = container.querySelector('[class*="top-1/2"]')
      expect(icon).toBeInTheDocument()
    })
  })
})
