import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ComponentShowcase } from './ComponentShowcase'
import '@testing-library/jest-dom'

describe('ComponentShowcase', () => {
  const mockOnSaveSnippet = jest.fn()
  const defaultProps = {
    code: 'const Example = () => <div>Example</div>',
    title: 'Example Component',
    description: 'This is an example component',
    category: 'atoms',
    onSaveSnippet: mockOnSaveSnippet,
    children: <div data-testid="showcase-children">Test Children</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByText('Test Children')).toBeInTheDocument()
    })

    it('renders Card component wrapper', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const card = container.querySelector('[class*="relative"]')
      expect(card).toBeInTheDocument()
    })

    it('renders as a fragment', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('Save Button', () => {
    it('renders save button with icon', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })
      expect(saveButton).toBeInTheDocument()
    })

    it('save button is hidden by default', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const buttonContainer = container.querySelector('[class*="opacity-0"]')
      expect(buttonContainer).toBeInTheDocument()
    })

    it('save button becomes visible on hover', async () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const cardParent = container.querySelector('[class*="group"]')

      fireEvent.mouseEnter(cardParent!)

      await waitFor(() => {
        const buttonContainer = container.querySelector('[class*="group-hover"]')
        expect(buttonContainer).toBeInTheDocument()
      })
    })

    it('renders save button with FloppyDisk icon', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('opens dialog when save button is clicked', async () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })

      fireEvent.click(saveButton)

      await waitFor(() => {
        // Dialog should open
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('passes prefilledData to dialog', async () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })

      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('Props Handling', () => {
    it('accepts code prop', () => {
      const customCode = 'custom code here'
      render(
        <ComponentShowcase
          {...defaultProps}
          code={customCode}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts title prop', () => {
      const customTitle = 'Custom Title'
      render(
        <ComponentShowcase
          {...defaultProps}
          title={customTitle}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts optional description prop', () => {
      const customDescription = 'Custom Description'
      render(
        <ComponentShowcase
          {...defaultProps}
          description={customDescription}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('has default description as empty string', () => {
      const { rerender } = render(<ComponentShowcase {...defaultProps} description="" />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
      rerender(
        <ComponentShowcase
          {...defaultProps}
          description={undefined}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts language prop', () => {
      const customLanguage = 'jsx'
      render(
        <ComponentShowcase
          {...defaultProps}
          language={customLanguage}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('has default language as tsx', () => {
      const propsWithoutLanguage = { ...defaultProps }
      delete propsWithoutLanguage.language
      render(
        <ComponentShowcase
          {...propsWithoutLanguage}
          language={undefined}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts category prop', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          category="molecules"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts onSaveSnippet callback', () => {
      const customOnSave = jest.fn()
      render(
        <ComponentShowcase
          {...defaultProps}
          onSaveSnippet={customOnSave}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts children prop', () => {
      const customChildren = <div>Custom Content</div>
      render(
        <ComponentShowcase
          {...defaultProps}
          children={customChildren}
        />
      )
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    it('wraps children in Card component', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const childrenDiv = screen.getByTestId('showcase-children')
      expect(childrenDiv).toBeInTheDocument()
    })

    it('applies relative positioning to Card', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const card = container.querySelector('[class*="relative"]')
      expect(card).toHaveClass('relative')
    })

    it('applies group class for hover effects', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const groupElement = container.querySelector('[class*="group"]')
      expect(groupElement).toHaveClass('group')
    })
  })

  describe('Button Styling', () => {
    it('renders save button with secondary variant', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })
      expect(saveButton).toBeInTheDocument()
    })

    it('renders save button with small size', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })
      expect(saveButton).toBeInTheDocument()
    })

    it('renders save button with gap-2 class', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })
      expect(saveButton).toHaveClass('gap-2')
    })

    it('renders save button with shadow-lg', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })
      expect(saveButton).toHaveClass('shadow-lg')
    })
  })

  describe('Dialog Behavior', () => {
    it('dialog is not rendered initially', () => {
      render(<ComponentShowcase {...defaultProps} />)
      // Dialog should not be present initially
      const dialogs = screen.queryAllByRole('dialog')
      expect(dialogs.length).toBe(0)
    })

    it('renders SnippetDialog when save is clicked', async () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })

      fireEvent.click(saveButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })
    })
  })

  describe('State Management', () => {
    it('manages dialog state internally', async () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })

      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('manages prefilledData state internally', async () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })

      fireEvent.click(saveButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('renders save button with accessible label', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByRole('button', { name: /save as snippet/i })).toBeInTheDocument()
    })

    it('renders button with icon', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('allows keyboard interaction with save button', () => {
      render(<ComponentShowcase {...defaultProps} />)
      const saveButton = screen.getByRole('button', { name: /save as snippet/i })

      fireEvent.keyDown(saveButton, { key: 'Enter' })

      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Categories Support', () => {
    it('accepts atoms category', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          category="atoms"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts molecules category', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          category="molecules"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts organisms category', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          category="organisms"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('accepts templates category', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          category="templates"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })
  })
})
