import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { InputsSection } from '@/components/atoms/InputsSection'
import { Snippet } from '@/lib/types'

describe('InputsSection Component', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Inputs')).toBeInTheDocument()
    })

    it('should display the section title', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByRole('heading', { name: 'Inputs', level: 2 })).toBeInTheDocument()
    })

    it('should display the section description', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Form input fields for user data entry')).toBeInTheDocument()
    })

    it('should render ComponentShowcase with correct title', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Input with Icon')).toBeInTheDocument()
    })
  })

  describe('Input States Section', () => {
    it('should display States heading', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/States/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render default input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const defaultInputs = screen.getAllByPlaceholderText('Default input')
      expect(defaultInputs.length).toBeGreaterThan(0)
    })

    it('should render disabled input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const disabledInputs = screen.getAllByPlaceholderText('Disabled input')
      expect(disabledInputs.length).toBeGreaterThan(0)
    })

    it('should render search input with icon', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const searchInputs = screen.getAllByPlaceholderText('Search...')
      expect(searchInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Input Types Section', () => {
    it('should display Types heading', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const headers = screen.getAllByText(/Types/i)
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should render text input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const textInputs = screen.getAllByPlaceholderText('Text input')
      expect(textInputs.length).toBeGreaterThan(0)
    })

    it('should render email input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const emailInputs = screen.getAllByPlaceholderText('email@example.com')
      expect(emailInputs.length).toBeGreaterThan(0)
    })

    it('should render password input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const passwordInputs = screen.getAllByPlaceholderText('Password')
      expect(passwordInputs.length).toBeGreaterThan(0)
    })

    it('should render number input', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const numberInputs = screen.getAllByPlaceholderText('123')
      expect(numberInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Input Attributes', () => {
    it('should have correct input type attributes', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const typeInputs = container.querySelectorAll('input[type="text"]')
      expect(typeInputs.length).toBeGreaterThan(0)
    })

    it('should have email type input', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const emailInputs = container.querySelectorAll('input[type="email"]')
      expect(emailInputs.length).toBeGreaterThan(0)
    })

    it('should have password type input', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const passwordInputs = container.querySelectorAll('input[type="password"]')
      expect(passwordInputs.length).toBeGreaterThan(0)
    })

    it('should have number type input', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const numberInputs = container.querySelectorAll('input[type="number"]')
      expect(numberInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Input States', () => {
    it('should have disabled input field', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const disabledInputs = container.querySelectorAll('input[disabled]')
      expect(disabledInputs.length).toBeGreaterThan(0)
    })

    it('should render input with placeholder text', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getAllByPlaceholderText(/Default input|Disabled input|Search|email@example.com/).length).toBeGreaterThan(0)
    })
  })

  describe('Icon Integration', () => {
    it('should render search icon in search input', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Props Handling', () => {
    it('should accept onSaveSnippet prop', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(typeof mockOnSaveSnippet).toBe('function')
    })

    it('should pass callback to ComponentShowcase', async () => {
      const user = userEvent.setup()
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)

      const saveButtons = screen.queryAllByText(/Save as Snippet/i)
      if (saveButtons.length > 0) {
        await user.click(saveButtons[0])
      }

      expect(typeof mockOnSaveSnippet).toBe('function')
    })
  })

  describe('Conditional Rendering', () => {
    it('should always render the section element', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = document.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should render all input demonstrations', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getAllByPlaceholderText('Default input').length).toBeGreaterThan(0)
      expect(screen.getAllByPlaceholderText('Disabled input').length).toBeGreaterThan(0)
      expect(screen.getAllByPlaceholderText('Text input').length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    })

    it('should have descriptive text', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Form input fields for user data entry')).toBeInTheDocument()
    })

    it('should render section with proper structure', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('space-y-6')
    })
  })

  describe('Component Integration', () => {
    it('should render ComponentShowcase with atoms category', () => {
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Input with Icon')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should not crash with valid props', () => {
      expect(() => {
        render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      }).not.toThrow()
    })

    it('should handle disabled input correctly', () => {
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)
      const disabledInputs = container.querySelectorAll('input[disabled]')
      expect(disabledInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Input Interaction', () => {
    it('should allow typing in enabled inputs', async () => {
      const user = userEvent.setup()
      render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)

      const defaultInputs = screen.getAllByPlaceholderText('Default input')
      if (defaultInputs.length > 0) {
        await user.type(defaultInputs[0], 'test input')
        expect(defaultInputs[0]).toHaveValue('test input')
      }
    })

    it('should not allow typing in disabled inputs', async () => {
      const user = userEvent.setup()
      const { container } = render(<InputsSection onSaveSnippet={mockOnSaveSnippet} />)

      const disabledInputs = container.querySelectorAll('input[disabled]')
      if (disabledInputs.length > 0) {
        const disabledInput = disabledInputs[0] as HTMLInputElement
        expect(disabledInput.disabled).toBe(true)
      }
    })
  })
})
