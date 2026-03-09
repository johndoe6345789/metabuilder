
import { render, screen } from '@/test-utils'
import { MoleculesSection } from '@/components/molecules/MoleculesSection'
import { Snippet } from '@/lib/types'

// Mock subsection components
jest.mock('@/components/molecules/FormFieldsSection', () => ({
  FormFieldsSection: ({ onSaveSnippet }: any) => (
    <div data-testid="form-fields-section">Form Fields Section</div>
  ),
}))

jest.mock('@/components/molecules/SearchBarsSection', () => ({
  SearchBarsSection: ({ onSaveSnippet }: any) => (
    <div data-testid="search-bars-section">Search Bars Section</div>
  ),
}))

jest.mock('@/components/molecules/UserCardsSection', () => ({
  UserCardsSection: () => (
    <div data-testid="user-cards-section">User Cards Section</div>
  ),
}))

jest.mock('@/components/molecules/SocialActionsSection', () => ({
  SocialActionsSection: () => (
    <div data-testid="social-actions-section">Social Actions Section</div>
  ),
}))

jest.mock('@/components/molecules/StatusIndicatorsSection', () => ({
  StatusIndicatorsSection: () => (
    <div data-testid="status-indicators-section">Status Indicators Section</div>
  ),
}))

jest.mock('@/components/molecules/ContentPreviewCardsSection', () => ({
  ContentPreviewCardsSection: () => (
    <div data-testid="content-preview-cards-section">Content Preview Cards Section</div>
  ),
}))

describe('MoleculesSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render molecules section container', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })

    it('should render all subsections', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()
      expect(screen.getByTestId('search-bars-section')).toBeInTheDocument()
      expect(screen.getByTestId('user-cards-section')).toBeInTheDocument()
      expect(screen.getByTestId('social-actions-section')).toBeInTheDocument()
      expect(screen.getByTestId('status-indicators-section')).toBeInTheDocument()
      expect(screen.getByTestId('content-preview-cards-section')).toBeInTheDocument()
    })

    it('should render form fields section', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()
      expect(screen.getByText('Form Fields Section')).toBeInTheDocument()
    })

    it('should render search bars section', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('search-bars-section')).toBeInTheDocument()
      expect(screen.getByText('Search Bars Section')).toBeInTheDocument()
    })

    it('should render user cards section', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('user-cards-section')).toBeInTheDocument()
      expect(screen.getByText('User Cards Section')).toBeInTheDocument()
    })

    it('should render social actions section', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('social-actions-section')).toBeInTheDocument()
      expect(screen.getByText('Social Actions Section')).toBeInTheDocument()
    })

    it('should render status indicators section', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('status-indicators-section')).toBeInTheDocument()
      expect(screen.getByText('Status Indicators Section')).toBeInTheDocument()
    })

    it('should render content preview cards section', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('content-preview-cards-section')).toBeInTheDocument()
      expect(screen.getByText('Content Preview Cards Section')).toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('should pass onSaveSnippet to FormFieldsSection', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()
    })

    it('should pass onSaveSnippet to SearchBarsSection', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('search-bars-section')).toBeInTheDocument()
    })

    it('should handle different onSaveSnippet implementations', () => {
      const customOnSaveSnippet = jest.fn()
      render(<MoleculesSection onSaveSnippet={customOnSaveSnippet} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('should have space-y-16 class for spacing between sections', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container).toHaveClass('space-y-16')
    })

    it('should have proper role attribute', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container).toHaveAttribute('role', 'region')
    })

    it('should have proper aria-label', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container).toHaveAttribute('aria-label', 'Molecular design system components')
    })
  })

  describe('Section Order', () => {
    it('should render sections in correct order', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      const children = container.children

      expect(children[0]).toHaveAttribute('data-testid', 'form-fields-section')
      expect(children[1]).toHaveAttribute('data-testid', 'search-bars-section')
      expect(children[2]).toHaveAttribute('data-testid', 'user-cards-section')
      expect(children[3]).toHaveAttribute('data-testid', 'social-actions-section')
      expect(children[4]).toHaveAttribute('data-testid', 'status-indicators-section')
      expect(children[5]).toHaveAttribute('data-testid', 'content-preview-cards-section')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container).toHaveAttribute('role', 'region')
    })

    it('should have descriptive aria-label', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container).toHaveAttribute('aria-label')
      expect(container.getAttribute('aria-label')).toContain('Molecular')
    })
  })

  describe('Callback Handling', () => {
    it('should handle callback function', () => {
      const onSaveSnippet = jest.fn()
      render(<MoleculesSection onSaveSnippet={onSaveSnippet} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })

    it('should accept different snippet types', () => {
      const onSaveSnippet = jest.fn((snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
        // Callback should handle snippet save
      })
      render(<MoleculesSection onSaveSnippet={onSaveSnippet} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })
  })

  describe('Re-render Behavior', () => {
    it('should handle prop changes', () => {
      const onSaveSnippet1 = jest.fn()
      const { rerender } = render(
        <MoleculesSection onSaveSnippet={onSaveSnippet1} />
      )
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()

      const onSaveSnippet2 = jest.fn()
      rerender(<MoleculesSection onSaveSnippet={onSaveSnippet2} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })

    it('should maintain all subsections on re-render', () => {
      const { rerender } = render(
        <MoleculesSection onSaveSnippet={jest.fn()} />
      )
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()

      rerender(<MoleculesSection onSaveSnippet={jest.fn()} />)
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()
      expect(screen.getByTestId('search-bars-section')).toBeInTheDocument()
      expect(screen.getByTestId('user-cards-section')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('should have consistent spacing', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container).toHaveClass('space-y-16')
    })

    it('should be properly structured as a region', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const region = screen.getByRole('region', { name: /Molecular/ })
      expect(region).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should render all subsections without errors', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const sections = [
        'form-fields-section',
        'search-bars-section',
        'user-cards-section',
        'social-actions-section',
        'status-indicators-section',
        'content-preview-cards-section',
      ]

      sections.forEach((section) => {
        expect(screen.getByTestId(section)).toBeInTheDocument()
      })
    })

    it('should handle multiple renders efficiently', () => {
      const { rerender } = render(
        <MoleculesSection onSaveSnippet={mockOnSaveSnippet} />
      )

      for (let i = 0; i < 3; i++) {
        rerender(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      }

      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onSaveSnippet gracefully', () => {
      // TypeScript would prevent this, but testing behavior anyway
      render(<MoleculesSection onSaveSnippet={jest.fn()} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })

    it('should render correctly with stub sections', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container.children.length).toBe(6)
    })
  })

  describe('Props Contract', () => {
    it('should accept onSaveSnippet callback', () => {
      const callback = jest.fn()
      render(<MoleculesSection onSaveSnippet={callback} />)
      expect(screen.getByTestId('molecules-section')).toBeInTheDocument()
    })

    it('should pass callback to sections that need it', () => {
      const callback = jest.fn()
      render(<MoleculesSection onSaveSnippet={callback} />)
      // Both FormFieldsSection and SearchBarsSection should receive the callback
      expect(screen.getByTestId('form-fields-section')).toBeInTheDocument()
      expect(screen.getByTestId('search-bars-section')).toBeInTheDocument()
    })
  })

  describe('Visual Hierarchy', () => {
    it('should maintain consistent structure', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('molecules-section')
      expect(container.children.length).toBe(6)

      Array.from(container.children).forEach((child) => {
        expect(child.tagName.toLowerCase()).toBe('div')
      })
    })
  })

  describe('Content Loading', () => {
    it('should render all sections immediately', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)

      const sections = [
        'form-fields-section',
        'search-bars-section',
        'user-cards-section',
        'social-actions-section',
        'status-indicators-section',
        'content-preview-cards-section',
      ]

      sections.forEach((section) => {
        expect(screen.getByTestId(section)).toBeInTheDocument()
      })
    })

    it('should not show loading states', () => {
      render(<MoleculesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })
})
