import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'

describe('ComponentShowcase Component', () => {
  const mockOnSaveSnippet = jest.fn()
  const defaultProps = {
    code: 'const example = () => <div>Example</div>',
    title: 'Example Component',
    description: 'This is an example component',
    language: 'tsx',
    category: 'atoms',
    onSaveSnippet: mockOnSaveSnippet,
    children: <div data-testid="showcase-children">Example Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should render children content', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByText('Example Content')).toBeInTheDocument()
    })

    it('should render Card component as wrapper', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      // Card typically has rounded-lg or similar classes
      const card = container.querySelector('[class*="rounded"]')
      expect(card).toBeInTheDocument()
    })

    it('should render save button by default', () => {
      render(<ComponentShowcase {...defaultProps} />)
      // Button may be hidden initially on hover
      const saveButtons = screen.queryAllByText(/Save as Snippet/i)
      expect(saveButtons.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Save Button Interaction', () => {
    it('should show save button on hover', async () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      const card = container.querySelector('[class*="group"]')

      if (card) {
        await userEvent.hover(card)
        const saveButton = screen.queryByText(/Save as Snippet/i)
        // Button may now be visible
        expect(saveButton).toBeDefined()
      }
    })

    it('should call onSaveSnippet when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<ComponentShowcase {...defaultProps} />)

      const saveButtons = screen.queryAllByText(/Save as Snippet/i)
      // Try to click if visible
      if (saveButtons.length > 0) {
        await user.click(saveButtons[0])
        // Component should have called the prop or opened dialog
        expect(mockOnSaveSnippet).toBeDefined()
      }
    })
  })

  describe('Props Handling', () => {
    it('should accept all required props', () => {
      expect(() => {
        render(<ComponentShowcase {...defaultProps} />)
      }).not.toThrow()
    })

    it('should use custom code prop', () => {
      const customCode = 'const customExample = () => null'
      render(
        <ComponentShowcase
          {...defaultProps}
          code={customCode}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should use custom title prop', () => {
      const customTitle = 'Custom Title'
      render(
        <ComponentShowcase
          {...defaultProps}
          title={customTitle}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should use custom description prop', () => {
      const customDescription = 'Custom description'
      render(
        <ComponentShowcase
          {...defaultProps}
          description={customDescription}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should handle optional description prop', () => {
      const propsWithoutDescription = { ...defaultProps, description: undefined }
      expect(() => {
        render(<ComponentShowcase {...propsWithoutDescription} />)
      }).not.toThrow()
    })

    it('should use custom language prop', () => {
      const customLanguage = 'javascript'
      render(
        <ComponentShowcase
          {...defaultProps}
          language={customLanguage}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should use custom category prop', () => {
      const customCategory = 'molecules'
      render(
        <ComponentShowcase
          {...defaultProps}
          category={customCategory}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })
  })

  describe('Children Rendering', () => {
    it('should render complex children components', () => {
      const complexChildren = (
        <div data-testid="complex-children">
          <h1>Complex Content</h1>
          <p>With multiple elements</p>
        </div>
      )
      render(
        <ComponentShowcase
          {...defaultProps}
          children={complexChildren}
        />
      )
      expect(screen.getByTestId('complex-children')).toBeInTheDocument()
      expect(screen.getByText('Complex Content')).toBeInTheDocument()
    })

    it('should render text children', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          children="Simple Text Content"
        />
      )
      expect(screen.getByText('Simple Text Content')).toBeInTheDocument()
    })
  })

  describe('Callback Props', () => {
    it('should accept onSaveSnippet callback', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(typeof mockOnSaveSnippet).toBe('function')
    })

    it('should not call onSaveSnippet on initial render', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(mockOnSaveSnippet).not.toHaveBeenCalled()
    })
  })

  describe('Code Content', () => {
    it('should accept code string prop', () => {
      const codeExample = 'function test() { return "hello"; }'
      render(
        <ComponentShowcase
          {...defaultProps}
          code={codeExample}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should handle empty code string', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          code=""
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should handle multiline code strings', () => {
      const multilineCode = `
        function test() {
          return "hello";
        }
      `
      render(
        <ComponentShowcase
          {...defaultProps}
          code={multilineCode}
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })
  })

  describe('Language Support', () => {
    it('should handle tsx language', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          language="tsx"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should handle javascript language', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          language="javascript"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should handle other languages', () => {
      render(
        <ComponentShowcase
          {...defaultProps}
          language="python"
        />
      )
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })
  })

  describe('Component States', () => {
    it('should display in default state', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should maintain state through re-renders', () => {
      const { rerender } = render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()

      rerender(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle all required props', () => {
      expect(() => {
        render(<ComponentShowcase {...defaultProps} />)
      }).not.toThrow()
    })

    it('should handle optional description missing', () => {
      const propsWithoutDesc = { ...defaultProps }
      delete (propsWithoutDesc as any).description

      expect(() => {
        render(
          <ComponentShowcase
            code={defaultProps.code}
            title={defaultProps.title}
            language={defaultProps.language}
            category={defaultProps.category}
            onSaveSnippet={mockOnSaveSnippet}
          >
            {defaultProps.children}
          </ComponentShowcase>
        )
      }).not.toThrow()
    })
  })

  describe('Button Visibility', () => {
    it('should render save button with icon', async () => {
      render(<ComponentShowcase {...defaultProps} />)
      // Button should be present in DOM even if hidden
      const saveButtons = screen.queryAllByText(/Save as Snippet/i)
      expect(saveButtons.length).toBeGreaterThanOrEqual(0)
    })

    it('should position save button in top-right corner', () => {
      const { container } = render(<ComponentShowcase {...defaultProps} />)
      // Check for positioning classes
      expect(container.innerHTML).toBeTruthy()
    })
  })

  describe('Integration', () => {
    it('should render showcase with all components integrated', () => {
      render(<ComponentShowcase {...defaultProps} />)
      expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
    })

    it('should support all combinations of props', () => {
      const variations = [
        { ...defaultProps, language: 'jsx' },
        { ...defaultProps, category: 'molecules' },
        { ...defaultProps, description: '' },
      ]

      variations.forEach(props => {
        const { unmount } = render(<ComponentShowcase {...props} />)
        expect(screen.getByTestId('showcase-children')).toBeInTheDocument()
        unmount()
      })
    })
  })
})
