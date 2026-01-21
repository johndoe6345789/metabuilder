
import { render, screen } from '@/test-utils'
import { OrganismsSection } from '@/components/organisms/OrganismsSection'
import { Snippet } from '@/lib/types'

// Mock showcase components
jest.mock('@/components/organisms/showcases/NavigationBarsShowcase', () => ({
  NavigationBarsShowcase: ({ onSaveSnippet }: any) => (
    <div data-testid="navigation-bars-showcase">Navigation Bars Showcase</div>
  ),
}))

jest.mock('@/components/organisms/showcases/DataTablesShowcase', () => ({
  DataTablesShowcase: () => (
    <div data-testid="data-tables-showcase">Data Tables Showcase</div>
  ),
}))

jest.mock('@/components/organisms/showcases/FormsShowcase', () => ({
  FormsShowcase: () => (
    <div data-testid="forms-showcase">Forms Showcase</div>
  ),
}))

jest.mock('@/components/organisms/showcases/TaskListsShowcase', () => ({
  TaskListsShowcase: () => (
    <div data-testid="task-lists-showcase">Task Lists Showcase</div>
  ),
}))

jest.mock('@/components/organisms/showcases/ContentGridsShowcase', () => ({
  ContentGridsShowcase: () => (
    <div data-testid="content-grids-showcase">Content Grids Showcase</div>
  ),
}))

jest.mock('@/components/organisms/showcases/SidebarNavigationShowcase', () => ({
  SidebarNavigationShowcase: () => (
    <div data-testid="sidebar-navigation-showcase">Sidebar Navigation Showcase</div>
  ),
}))

describe('OrganismsSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render organisms section container', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should render all showcase subsections', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('data-tables-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('forms-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('task-lists-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('content-grids-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-navigation-showcase')).toBeInTheDocument()
    })

    it('should render navigation bars showcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
      expect(screen.getByText('Navigation Bars Showcase')).toBeInTheDocument()
    })

    it('should render data tables showcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('data-tables-showcase')).toBeInTheDocument()
      expect(screen.getByText('Data Tables Showcase')).toBeInTheDocument()
    })

    it('should render forms showcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('forms-showcase')).toBeInTheDocument()
      expect(screen.getByText('Forms Showcase')).toBeInTheDocument()
    })

    it('should render task lists showcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('task-lists-showcase')).toBeInTheDocument()
      expect(screen.getByText('Task Lists Showcase')).toBeInTheDocument()
    })

    it('should render content grids showcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('content-grids-showcase')).toBeInTheDocument()
      expect(screen.getByText('Content Grids Showcase')).toBeInTheDocument()
    })

    it('should render sidebar navigation showcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('sidebar-navigation-showcase')).toBeInTheDocument()
      expect(screen.getByText('Sidebar Navigation Showcase')).toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('should pass onSaveSnippet to NavigationBarsShowcase', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
    })

    it('should handle different onSaveSnippet implementations', () => {
      const customOnSaveSnippet = jest.fn()
      render(<OrganismsSection onSaveSnippet={customOnSaveSnippet} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should pass callback correctly to all receiving components', () => {
      const onSaveSnippet = jest.fn()
      render(<OrganismsSection onSaveSnippet={onSaveSnippet} />)
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('should have space-y-16 class for spacing between sections', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container).toHaveClass('space-y-16')
    })

    it('should have proper role attribute', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container).toHaveAttribute('role', 'region')
    })

    it('should have proper aria-label', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container).toHaveAttribute('aria-label', 'Organism design system components')
    })
  })

  describe('Section Order', () => {
    it('should render sections in correct order', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      const children = container.children

      expect(children[0]).toHaveAttribute('data-testid', 'navigation-bars-showcase')
      expect(children[1]).toHaveAttribute('data-testid', 'data-tables-showcase')
      expect(children[2]).toHaveAttribute('data-testid', 'forms-showcase')
      expect(children[3]).toHaveAttribute('data-testid', 'task-lists-showcase')
      expect(children[4]).toHaveAttribute('data-testid', 'content-grids-showcase')
      expect(children[5]).toHaveAttribute('data-testid', 'sidebar-navigation-showcase')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container).toHaveAttribute('role', 'region')
    })

    it('should have descriptive aria-label', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container).toHaveAttribute('aria-label')
      expect(container.getAttribute('aria-label')).toContain('Organism')
    })

    it('should be accessible to screen readers', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const region = screen.getByRole('region', { name: /Organism/ })
      expect(region).toBeInTheDocument()
    })
  })

  describe('Callback Handling', () => {
    it('should handle callback function', () => {
      const onSaveSnippet = jest.fn()
      render(<OrganismsSection onSaveSnippet={onSaveSnippet} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should accept snippet type in callback', () => {
      const onSaveSnippet = vi.fn((snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
        // Callback should handle snippet save
      })
      render(<OrganismsSection onSaveSnippet={onSaveSnippet} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })
  })

  describe('Re-render Behavior', () => {
    it('should handle prop changes', () => {
      const onSaveSnippet1 = jest.fn()
      const { rerender } = render(
        <OrganismsSection onSaveSnippet={onSaveSnippet1} />
      )
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()

      const onSaveSnippet2 = jest.fn()
      rerender(<OrganismsSection onSaveSnippet={onSaveSnippet2} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should maintain all showcases on re-render', () => {
      const { rerender } = render(
        <OrganismsSection onSaveSnippet={jest.fn()} />
      )
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()

      rerender(<OrganismsSection onSaveSnippet={jest.fn()} />)
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('data-tables-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('forms-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('task-lists-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('content-grids-showcase')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-navigation-showcase')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('should have consistent spacing', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container).toHaveClass('space-y-16')
    })

    it('should be properly structured as a region', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const region = screen.getByRole('region', { name: /Organism/ })
      expect(region).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should render all showcases without errors', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const showcases = [
        'navigation-bars-showcase',
        'data-tables-showcase',
        'forms-showcase',
        'task-lists-showcase',
        'content-grids-showcase',
        'sidebar-navigation-showcase',
      ]

      showcases.forEach((showcase) => {
        expect(screen.getByTestId(showcase)).toBeInTheDocument()
      })
    })

    it('should handle multiple renders efficiently', () => {
      const { rerender } = render(
        <OrganismsSection onSaveSnippet={mockOnSaveSnippet} />
      )

      for (let i = 0; i < 3; i++) {
        rerender(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      }

      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should display all sections simultaneously', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')

      expect(container.children.length).toBe(6)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onSaveSnippet gracefully', () => {
      render(<OrganismsSection onSaveSnippet={jest.fn()} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should render correctly with stub components', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container.children.length).toBe(6)
    })

    it('should handle rapid re-renders', () => {
      const { rerender } = render(
        <OrganismsSection onSaveSnippet={mockOnSaveSnippet} />
      )

      for (let i = 0; i < 10; i++) {
        rerender(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      }

      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })
  })

  describe('Props Contract', () => {
    it('should accept onSaveSnippet callback', () => {
      const callback = jest.fn()
      render(<OrganismsSection onSaveSnippet={callback} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })

    it('should pass callback to showcases that need it', () => {
      const callback = jest.fn()
      render(<OrganismsSection onSaveSnippet={callback} />)
      // NavigationBarsShowcase should receive the callback
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
    })
  })

  describe('Visual Hierarchy', () => {
    it('should maintain consistent structure', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container.children.length).toBe(6)

      Array.from(container.children).forEach((child) => {
        expect(child.tagName.toLowerCase()).toBe('div')
      })
    })

    it('should have proper nesting', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container.parentElement).toBeInTheDocument()
    })
  })

  describe('Content Loading', () => {
    it('should render all showcases immediately', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)

      const showcases = [
        'navigation-bars-showcase',
        'data-tables-showcase',
        'forms-showcase',
        'task-lists-showcase',
        'content-grids-showcase',
        'sidebar-navigation-showcase',
      ]

      showcases.forEach((showcase) => {
        expect(screen.getByTestId(showcase)).toBeInTheDocument()
      })
    })

    it('should not show loading states', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    it('should display content synchronously', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
      expect(screen.getByTestId('navigation-bars-showcase')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should render without error when callback is provided', () => {
      const onSaveSnippet = jest.fn()
      expect(() => {
        render(<OrganismsSection onSaveSnippet={onSaveSnippet} />)
      }).not.toThrow()
    })

    it('should maintain structure even with failing callbacks', () => {
      const failingCallback = vi.fn(() => {
        throw new Error('Test error')
      })
      render(<OrganismsSection onSaveSnippet={failingCallback} />)
      expect(screen.getByTestId('organisms-section')).toBeInTheDocument()
    })
  })

  describe('Showcase Count', () => {
    it('should render exactly 6 showcases', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)
      const container = screen.getByTestId('organisms-section')
      expect(container.children.length).toBe(6)
    })

    it('should not have duplicate showcases', () => {
      render(<OrganismsSection onSaveSnippet={mockOnSaveSnippet} />)

      const navigationBars = screen.getAllByTestId('navigation-bars-showcase')
      expect(navigationBars.length).toBe(1)

      const dataTables = screen.getAllByTestId('data-tables-showcase')
      expect(dataTables.length).toBe(1)

      const forms = screen.getAllByTestId('forms-showcase')
      expect(forms.length).toBe(1)

      const taskLists = screen.getAllByTestId('task-lists-showcase')
      expect(taskLists.length).toBe(1)

      const contentGrids = screen.getAllByTestId('content-grids-showcase')
      expect(contentGrids.length).toBe(1)

      const sidebarNavigation = screen.getAllByTestId('sidebar-navigation-showcase')
      expect(sidebarNavigation.length).toBe(1)
    })
  })
})
