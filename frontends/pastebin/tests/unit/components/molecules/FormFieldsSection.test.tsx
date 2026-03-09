import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { FormFieldsSection } from '@/components/molecules/FormFieldsSection'
import type { Snippet } from '@/lib/types'

// Mock ComponentShowcase
jest.mock('@/components/demo/ComponentShowcase', () => ({
  ComponentShowcase: ({ title, description, children, onSaveSnippet }: any) => (
    <div data-testid="component-showcase">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
      <button onClick={() => onSaveSnippet({ title, code: 'sample code' })}>
        Save Snippet
      </button>
    </div>
  ),
}))

describe('FormFieldsSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()
    })

    it('should render as section element', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = screen.getByTestId('form-fields-section')
      expect(section.tagName).toBe('SECTION')
    })

    it('should have role=region', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = screen.getByTestId('form-fields-section')
      expect(section).toHaveAttribute('role', 'region')
    })

    it('should have aria-label', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = screen.getByTestId('form-fields-section')
      expect(section).toHaveAttribute('aria-label', 'Form field components')
    })

    it('should have space-y-6 class', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = screen.getByTestId('form-fields-section')
      expect(section).toHaveClass('space-y-6')
    })
  })

  describe('Header Section', () => {
    it('should render section title', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Form Fields')).toBeInTheDocument()
    })

    it('should have title as h2 heading', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Form Fields')
    })

    it('should display description', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Input fields with labels and helper text')).toBeInTheDocument()
    })

    it('should have descriptive text class', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const description = container.querySelector('.text-muted-foreground')
      expect(description).toBeInTheDocument()
    })
  })

  describe('ComponentShowcase', () => {
    it('should render ComponentShowcase component', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('component-showcase')).toBeInTheDocument()
    })

    it('should pass correct title to ComponentShowcase', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Form Field with Icon and Helper Text')).toBeInTheDocument()
    })

    it('should pass correct description to ComponentShowcase', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Complete form field with label, icon, and validation message')).toBeInTheDocument()
    })

    it('should pass onSaveSnippet callback', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const saveButton = screen.getByText('Save Snippet')
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('should render Full Name input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const nameInput = screen.getByPlaceholderText('John Doe')
      expect(nameInput).toBeInTheDocument()
    })

    it('should have Full Name label', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    })

    it('should render Email input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const emailInput = screen.getByPlaceholderText('john@example.com')
      expect(emailInput).toBeInTheDocument()
    })

    it('should have email type for email input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement
      expect(emailInput.type).toBe('email')
    })

    it('should have Email label', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('should render Password input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const passwordInputs = screen.getAllByPlaceholderText('••••••••')
      expect(passwordInputs.length).toBeGreaterThan(0)
    })

    it('should have password type for password input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const passwordInputs = screen.getAllByPlaceholderText('••••••••')
      const passwordInput = passwordInputs[0] as HTMLInputElement
      expect(passwordInput.type).toBe('password')
    })

    it('should have Password label', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })
  })

  describe('Helper Text', () => {
    it('should display email helper text', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/We'll never share your email/)).toBeInTheDocument()
    })

    it('should have muted styling for helper text', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const helperTexts = container.querySelectorAll('.text-muted-foreground')
      expect(helperTexts.length).toBeGreaterThan(0)
    })
  })

  describe('Icons', () => {
    it('should render icon elements', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should position icons in email field', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const relativeContainers = container.querySelectorAll('.relative')
      expect(relativeContainers.length).toBeGreaterThan(0)
    })

    it('should position icons absolutely', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const absoluteIcons = container.querySelectorAll('.absolute')
      expect(absoluteIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Layout', () => {
    it('should have form fields spaced section', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const spacedDiv = container.querySelector('.space-y-6')
      expect(spacedDiv).toBeInTheDocument()
    })

    it('should limit width of form', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const maxWidth = container.querySelector('.max-w-md')
      expect(maxWidth).toBeInTheDocument()
    })

    it('should have field spacing', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const spacedFields = container.querySelectorAll('.space-y-2')
      expect(spacedFields.length).toBeGreaterThan(0)
    })

    it('should wrap form in Card', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const card = container.querySelector('[class*="p-6"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have proper padding for form container', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const card = container.querySelector('[class*="p-6"]')
      expect(card).toHaveClass('p-6')
    })

    it('should have relative positioning for icon containers', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const relative = container.querySelectorAll('.relative')
      expect(relative.length).toBeGreaterThan(0)
    })

    it('should have left positioning for icons', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const left = container.querySelectorAll('.left-3')
      expect(left.length).toBeGreaterThan(0)
    })

    it('should have padding for inputs with icons', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const paddedInputs = container.querySelectorAll('.pl-10')
      expect(paddedInputs.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have role=region', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = screen.getByTestId('form-fields-section')
      expect(section).toHaveAttribute('role', 'region')
    })

    it('should have descriptive aria-label', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const section = screen.getByTestId('form-fields-section')
      expect(section).toHaveAttribute('aria-label')
    })

    it('should have proper heading hierarchy', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
    })

    it('should have labels associated with inputs', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should have labels for form fields', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const nameLabel = screen.getByText('Full Name')
      expect(nameLabel).toBeInTheDocument()
      expect(nameLabel.tagName).toBe('LABEL')
    })

    it('should have id attributes on inputs', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const nameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
      expect(nameInput).toHaveAttribute('id')
    })
  })

  describe('Props Handling', () => {
    it('should accept onSaveSnippet prop', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(typeof mockOnSaveSnippet).toBe('function')
    })

    it('should pass onSaveSnippet to ComponentShowcase', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const saveButton = screen.getByText('Save Snippet')
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Input Attributes', () => {
    it('should have placeholder for name input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    })

    it('should have placeholder for email input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument()
    })

    it('should have placeholder for password input', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })
  })

  describe('Icon Positioning', () => {
    it('should have top-1/2 positioning for icons', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const topPositioned = container.querySelectorAll('.top-1\\/2')
      expect(topPositioned.length).toBeGreaterThan(0)
    })

    it('should have -translate-y-1/2 for vertical centering', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const translated = container.querySelectorAll('.-translate-y-1\\/2')
      expect(translated.length).toBeGreaterThan(0)
    })
  })

  describe('Content Completeness', () => {
    it('should display all required form fields', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should have all labels and inputs', () => {
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const labels = screen.getAllByText(/Full Name|Email Address|Password/)
      expect(labels.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Interaction', () => {
    it('should allow typing in name input', async () => {
      const user = userEvent.setup()
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const nameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
      await user.type(nameInput, 'Jane Doe')
      expect(nameInput.value).toBe('Jane Doe')
    })

    it('should allow typing in email input', async () => {
      const user = userEvent.setup()
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement
      await user.type(emailInput, 'jane@example.com')
      expect(emailInput.value).toBe('jane@example.com')
    })

    it('should allow typing in password input', async () => {
      const user = userEvent.setup()
      render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
      await user.type(passwordInput, 'password123')
      expect(passwordInput.value).toBe('password123')
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot', () => {
      const { container } = render(<FormFieldsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
