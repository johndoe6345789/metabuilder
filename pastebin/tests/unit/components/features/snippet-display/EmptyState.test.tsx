
import { render, screen, fireEvent } from '@/test-utils'
import { EmptyState } from '@/components/features/snippet-display/EmptyState'

// Mock dependencies
jest.mock('@/data/templates.json', () => [
  { id: 'react-1', category: 'react', title: 'React Button', description: 'A simple button', language: 'JSX' },
  { id: 'react-2', category: 'react', title: 'React Form', description: 'A form component', language: 'JSX' },
  { id: 'api-1', category: 'api', title: 'API Call', description: 'Fetch data', language: 'JavaScript' },
  { id: 'layout-1', category: 'layout', title: 'CSS Grid', description: 'Grid layout', language: 'CSS' },
  { id: 'euler-1', category: 'euler', title: 'Problem 1', description: 'Fibonacci', language: 'Python' },
  { id: 'algo-1', category: 'algorithms', title: 'Sort', description: 'Sorting algorithm', language: 'Python' },
  { id: 'interactive-1', category: 'interactive', title: 'Game', description: 'Simple game', language: 'Python' },
])

describe('EmptyState', () => {
  const defaultProps = {
    onCreateClick: jest.fn(),
    onCreateFromTemplate: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render empty state container', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should display icon', () => {
      render(<EmptyState {...defaultProps} />)
      // Icon will be inside the container
      const container = screen.getByTestId('empty-state')
      expect(container.querySelector('[class*="bg-accent"]')).toBeInTheDocument()
    })

    it('should display title text', () => {
      render(<EmptyState {...defaultProps} />)
      // The title comes from config strings
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toBeInTheDocument()
    })

    it('should display description text', () => {
      render(<EmptyState {...defaultProps} />)
      const description = document.querySelector('.text-muted-foreground')
      expect(description).toBeInTheDocument()
    })

    it('should display create button', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByTestId('empty-state-create-menu')).toBeInTheDocument()
    })
  })

  describe('Create Menu Button', () => {
    it('should render create menu button', () => {
      render(<EmptyState {...defaultProps} />)
      expect(screen.getByTestId('empty-state-create-menu')).toBeInTheDocument()
    })

    it('should have correct button text', () => {
      render(<EmptyState {...defaultProps} />)
      // Button text comes from config
      const button = screen.getByTestId('empty-state-create-menu')
      expect(button).toBeInTheDocument()
    })

    it('should have correct aria-label', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      expect(button).toHaveAttribute('aria-label', 'Create new snippet from templates')
    })

    it('should have size lg', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      expect(button).toHaveClass('gap-2')
    })

    it('should open dropdown menu when clicked', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByTestId('empty-state-menu-content')).toBeInTheDocument()
    })
  })

  describe('Menu Content', () => {
    it('should display dropdown menu content', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByTestId('empty-state-menu-content')).toBeInTheDocument()
    })

    it('should display blank snippet option', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByTestId('create-blank-snippet-item')).toBeInTheDocument()
      expect(screen.getByText('Blank Snippet')).toBeInTheDocument()
    })

    it('should display React Components section', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByText('React Components')).toBeInTheDocument()
    })

    it('should display JavaScript / TypeScript section', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByText('JavaScript / TypeScript')).toBeInTheDocument()
    })

    it('should display CSS Layouts section', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByText('CSS Layouts')).toBeInTheDocument()
    })

    it('should display Python - Project Euler section', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByText('Python - Project Euler')).toBeInTheDocument()
    })

    it('should display Python - Algorithms section', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByText('Python - Algorithms')).toBeInTheDocument()
    })

    it('should display Python - Interactive Programs section', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByText('Python - Interactive Programs')).toBeInTheDocument()
    })
  })

  describe('Blank Snippet Creation', () => {
    it('should call onCreateClick when blank snippet is clicked', () => {
      const onCreateClick = jest.fn()
      render(<EmptyState {...defaultProps} onCreateClick={onCreateClick} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      const blankItem = screen.getByTestId('create-blank-snippet-item')
      fireEvent.click(blankItem)
      expect(onCreateClick).toHaveBeenCalled()
    })

    it('should not call onCreateFromTemplate when blank snippet is clicked', () => {
      const onCreateFromTemplate = jest.fn()
      render(
        <EmptyState
          {...defaultProps}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      )
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      const blankItem = screen.getByTestId('create-blank-snippet-item')
      fireEvent.click(blankItem)
      expect(onCreateFromTemplate).not.toHaveBeenCalled()
    })
  })

  describe('Template Selection', () => {
    it('should call onCreateFromTemplate with template id', () => {
      const onCreateFromTemplate = jest.fn()
      render(
        <EmptyState
          {...defaultProps}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      )
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const reactTemplate = screen.getByTestId('template-react-react-1')
      fireEvent.click(reactTemplate)
      expect(onCreateFromTemplate).toHaveBeenCalledWith('react-1')
    })

    it('should display react template options', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      expect(screen.getByTestId('template-react-react-1')).toBeInTheDocument()
      expect(screen.getByTestId('template-react-react-2')).toBeInTheDocument()
    })

    it('should display template title', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      expect(screen.getByText('React Button')).toBeInTheDocument()
      expect(screen.getByText('React Form')).toBeInTheDocument()
    })

    it('should display template description', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      expect(screen.getByText('A simple button')).toBeInTheDocument()
      expect(screen.getByText('A form component')).toBeInTheDocument()
    })

    it('should filter templates by category correctly', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      // React section should have react templates
      const reactSection = screen.getByText('React Components')
      const reactParent = reactSection.closest('div')?.parentElement
      expect(screen.getByTestId('template-react-react-1')).toBeInTheDocument()

      // CSS should have layout templates
      const cssSection = screen.getByText('CSS Layouts')
      expect(screen.getByText('CSS Grid')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role=status for empty state', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toHaveAttribute('role', 'status')
    })

    it('should have aria-label for empty state', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toHaveAttribute('aria-label', 'No snippets available')
    })

    it('should have aria-hidden on icon', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      const icon = container.querySelector('[class*="bg-accent"]')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have aria-label on create menu button', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      expect(button).toHaveAttribute('aria-label')
    })
  })

  describe('Styling', () => {
    it('should have centered flex layout', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('should have text-center class', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('text-center')
    })

    it('should have vertical padding', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('py-20')
    })

    it('should have horizontal padding', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toHaveClass('px-4')
    })

    it('should have accent background for icon container', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      const iconContainer = container.querySelector('[class*="bg-accent"]')
      expect(iconContainer).toHaveClass('rounded-full')
    })
  })

  describe('Menu Structure', () => {
    it('should have menu content with scroll', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const content = screen.getByTestId('empty-state-menu-content')
      expect(content).toHaveClass('overflow-y-auto')
    })

    it('should have max height on menu content', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const content = screen.getByTestId('empty-state-menu-content')
      expect(content).toHaveClass('max-h-[500px]')
    })

    it('should have separators between sections', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      // Multiple separators should exist
      const content = screen.getByTestId('empty-state-menu-content')
      const separators = content.querySelectorAll('[role="separator"]')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('Callback Handling', () => {
    it('should handle onCreateClick being optional', () => {
      render(
        <EmptyState
          onCreateFromTemplate={jest.fn()}
        />
      )
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByTestId('create-blank-snippet-item')).toBeInTheDocument()
    })

    it('should handle onCreateFromTemplate being optional', () => {
      render(
        <EmptyState onCreateClick={jest.fn()} />
      )
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)
      expect(screen.getByTestId('create-blank-snippet-item')).toBeInTheDocument()
    })

    it('should handle both callbacks being provided', () => {
      const onCreateClick = jest.fn()
      const onCreateFromTemplate = jest.fn()
      render(
        <EmptyState
          onCreateClick={onCreateClick}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      )

      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      // Test blank snippet
      const blankItem = screen.getByTestId('create-blank-snippet-item')
      fireEvent.click(blankItem)
      expect(onCreateClick).toHaveBeenCalled()

      // Test template
      const templateItem = screen.getByTestId('template-react-react-1')
      fireEvent.click(templateItem)
      expect(onCreateFromTemplate).toHaveBeenCalledWith('react-1')
    })
  })

  describe('Edge Cases', () => {
    it('should render with no templates', () => {
      render(<EmptyState {...defaultProps} />)
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
    })

    it('should handle rapid menu open/close', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')

      fireEvent.click(button)
      expect(screen.getByTestId('empty-state-menu-content')).toBeInTheDocument()

      fireEvent.click(button)
      // Menu should close or be hidden
    })

    it('should handle multiple template selections', () => {
      const onCreateFromTemplate = jest.fn()
      render(
        <EmptyState
          {...defaultProps}
          onCreateFromTemplate={onCreateFromTemplate}
        />
      )

      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const template1 = screen.getByTestId('template-react-react-1')
      fireEvent.click(template1)
      expect(onCreateFromTemplate).toHaveBeenCalledWith('react-1')

      // Reopen menu
      fireEvent.click(button)
      const template2 = screen.getByTestId('template-react-react-2')
      fireEvent.click(template2)
      expect(onCreateFromTemplate).toHaveBeenCalledWith('react-2')

      expect(onCreateFromTemplate).toHaveBeenCalledTimes(2)
    })
  })

  describe('Template Categories', () => {
    it('should correctly categorize react templates', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const reactSection = screen.getByText('React Components')
      expect(reactSection).toBeInTheDocument()
      expect(screen.getByText('React Button')).toBeInTheDocument()
    })

    it('should correctly categorize javascript templates', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const jsSection = screen.getByText('JavaScript / TypeScript')
      expect(jsSection).toBeInTheDocument()
    })

    it('should correctly categorize CSS templates', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      const cssSection = screen.getByText('CSS Layouts')
      expect(cssSection).toBeInTheDocument()
      expect(screen.getByText('CSS Grid')).toBeInTheDocument()
    })

    it('should correctly categorize Python templates', () => {
      render(<EmptyState {...defaultProps} />)
      const button = screen.getByTestId('empty-state-create-menu')
      fireEvent.click(button)

      expect(screen.getByText('Python - Project Euler')).toBeInTheDocument()
      expect(screen.getByText('Python - Algorithms')).toBeInTheDocument()
      expect(screen.getByText('Python - Interactive Programs')).toBeInTheDocument()
    })
  })
})
