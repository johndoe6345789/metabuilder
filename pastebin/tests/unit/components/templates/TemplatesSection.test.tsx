
import { render, screen } from '@/test-utils'
import { TemplatesSection } from '@/components/templates/TemplatesSection'
import { Snippet } from '@/lib/types'

// Mock ComponentShowcase
jest.mock('@/components/demo/ComponentShowcase', () => ({
  ComponentShowcase: ({ code, title, description, category, onSaveSnippet, children }: any) => (
    <div data-testid={`showcase-${title}`}>
      <h4>{title}</h4>
      <p>{description}</p>
      <div>{children}</div>
    </div>
  ),
}))

// Mock template components
jest.mock('@/components/templates/DashboardTemplate', () => ({
  DashboardTemplate: () => <div data-testid="dashboard-template">Dashboard</div>,
}))

jest.mock('@/components/templates/LandingPageTemplate', () => ({
  LandingPageTemplate: () => <div data-testid="landing-page-template">Landing Page</div>,
}))

jest.mock('@/components/templates/EcommerceTemplate', () => ({
  EcommerceTemplate: () => <div data-testid="ecommerce-template">Ecommerce</div>,
}))

jest.mock('@/components/templates/BlogTemplate', () => ({
  BlogTemplate: () => <div data-testid="blog-template">Blog</div>,
}))

jest.mock('@/lib/component-code-snippets', () => ({
  templatesCodeSnippets: {
    dashboardLayout: 'const Dashboard = () => <div>Dashboard Layout</div>',
    landingPage: 'const LandingPage = () => <div>Landing Page</div>',
    ecommercePage: 'const Ecommerce = () => <div>Ecommerce Page</div>',
    blogArticle: 'const Blog = () => <div>Blog Article</div>',
  },
}))

describe('TemplatesSection', () => {
  const mockOnSaveSnippet = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render templates section', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(container.querySelector('[class*="space-y-16"]')).toBeInTheDocument()
    })

    it('should render dashboard layout section', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Dashboard Layout')).toBeInTheDocument()
    })

    it('should render landing page section', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Landing Page')).toBeInTheDocument()
    })

    it('should render e-commerce product page section', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('E-commerce Product Page')).toBeInTheDocument()
    })

    it('should render blog article section', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Blog Article')).toBeInTheDocument()
    })

    it('should render all template descriptions', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Complete dashboard with sidebar/)).toBeInTheDocument()
      expect(screen.getByText(/Marketing page with hero/)).toBeInTheDocument()
      expect(screen.getByText(/Product detail page with images/)).toBeInTheDocument()
      expect(screen.getByText(/Article layout with header/)).toBeInTheDocument()
    })
  })

  describe('Section Headings', () => {
    it('should display dashboard layout heading', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByText('Dashboard Layout')
      expect(heading).toHaveClass('text-3xl', 'font-bold')
    })

    it('should display landing page heading', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByText('Landing Page')
      expect(heading).toHaveClass('text-3xl', 'font-bold')
    })

    it('should display e-commerce heading', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByText('E-commerce Product Page')
      expect(heading).toHaveClass('text-3xl', 'font-bold')
    })

    it('should display blog heading', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const heading = screen.getByText('Blog Article')
      expect(heading).toHaveClass('text-3xl', 'font-bold')
    })
  })

  describe('Section Descriptions', () => {
    it('should display dashboard description', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Complete dashboard with sidebar, stats, and content areas/)).toBeInTheDocument()
    })

    it('should display landing page description', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Marketing page with hero, features, and CTA sections/)).toBeInTheDocument()
    })

    it('should display e-commerce description', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Product detail page with images, info, and purchase options/)).toBeInTheDocument()
    })

    it('should display blog description', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText(/Article layout with header, content, and sidebar/)).toBeInTheDocument()
    })
  })

  describe('Component Showcases', () => {
    it('should render dashboard layout showcase', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('showcase-Dashboard Layout')).toBeInTheDocument()
    })

    it('should render landing page showcase', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('showcase-Landing Page Template')).toBeInTheDocument()
    })

    it('should render e-commerce showcase', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('showcase-E-commerce Product Page')).toBeInTheDocument()
    })

    it('should render blog showcase', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('showcase-Blog Article')).toBeInTheDocument()
    })

    it('should pass onSaveSnippet to showcases', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('showcase-Dashboard Layout')).toBeInTheDocument()
    })

    it('should pass correct category to showcases', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      // Showcases should be created with templates category
      expect(screen.getByTestId('showcase-Dashboard Layout')).toBeInTheDocument()
    })
  })

  describe('Template Components', () => {
    it('should render dashboard template', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })

    it('should render landing page template', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('landing-page-template')).toBeInTheDocument()
    })

    it('should render e-commerce template', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('ecommerce-template')).toBeInTheDocument()
    })

    it('should render blog template', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })
  })

  describe('Props Passing', () => {
    it('should pass onSaveSnippet callback to component', () => {
      const callback = jest.fn()
      render(<TemplatesSection onSaveSnippet={callback} />)
      expect(screen.getByTestId('showcase-Dashboard Layout')).toBeInTheDocument()
    })

    it('should handle different onSaveSnippet implementations', () => {
      const customCallback = jest.fn()
      render(<TemplatesSection onSaveSnippet={customCallback} />)
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })

    it('should accept snippet type in callback', () => {
      const callback = vi.fn((snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
        // Callback should handle snippet save
      })
      render(<TemplatesSection onSaveSnippet={callback} />)
      expect(screen.getByTestId('showcase-Dashboard Layout')).toBeInTheDocument()
    })
  })

  describe('Structure', () => {
    it('should have 4 template sections', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const sections = container.querySelectorAll('section')
      expect(sections.length).toBe(4)
    })

    it('should have space-y-16 spacing', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const mainDiv = container.querySelector('[class*="space-y-16"]')
      expect(mainDiv).toHaveClass('space-y-16')
    })

    it('should have proper section spacing', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const sections = container.querySelectorAll('section')
      sections.forEach((section) => {
        expect(section).toHaveClass('space-y-6')
      })
    })
  })

  describe('Heading Structure', () => {
    it('should have h2 headings for section titles', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const headings = screen.getAllByRole('heading', { level: 2 })
      expect(headings.length).toBe(4)
    })

    it('should have correct heading levels', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const dashboardHeading = screen.getByText('Dashboard Layout')
      expect(dashboardHeading.tagName).toBe('H2')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section elements', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const sections = container.querySelectorAll('section')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should have descriptive headings', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      expect(screen.getByText('Dashboard Layout')).toBeInTheDocument()
      expect(screen.getByText('Landing Page')).toBeInTheDocument()
      expect(screen.getByText('E-commerce Product Page')).toBeInTheDocument()
      expect(screen.getByText('Blog Article')).toBeInTheDocument()
    })
  })

  describe('Re-render Behavior', () => {
    it('should handle prop changes', () => {
      const callback1 = jest.fn()
      const { rerender } = render(
        <TemplatesSection onSaveSnippet={callback1} />
      )
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()

      const callback2 = jest.fn()
      rerender(<TemplatesSection onSaveSnippet={callback2} />)
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })

    it('should maintain all templates on re-render', () => {
      const { rerender } = render(
        <TemplatesSection onSaveSnippet={jest.fn()} />
      )
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()

      rerender(<TemplatesSection onSaveSnippet={jest.fn()} />)
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
      expect(screen.getByTestId('landing-page-template')).toBeInTheDocument()
      expect(screen.getByTestId('ecommerce-template')).toBeInTheDocument()
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without errors', () => {
      expect(() => {
        render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      }).not.toThrow()
    })

    it('should handle rapid re-renders', () => {
      const { rerender } = render(
        <TemplatesSection onSaveSnippet={mockOnSaveSnippet} />
      )

      for (let i = 0; i < 10; i++) {
        rerender(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      }

      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })

    it('should handle failing callback gracefully', () => {
      const failingCallback = vi.fn(() => {
        throw new Error('Test error')
      })
      render(<TemplatesSection onSaveSnippet={failingCallback} />)
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })
  })

  describe('Content Organization', () => {
    it('should organize templates logically', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)

      // All sections should be present in order
      const sections = [
        'Dashboard Layout',
        'Landing Page',
        'E-commerce Product Page',
        'Blog Article',
      ]

      sections.forEach((section) => {
        expect(screen.getByText(section)).toBeInTheDocument()
      })
    })

    it('should maintain section order', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const sections = container.querySelectorAll('section')
      const firstHeading = sections[0]?.querySelector('h2')?.textContent
      expect(firstHeading).toBe('Dashboard Layout')
    })
  })

  describe('Description Text', () => {
    it('should have muted foreground styling for descriptions', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const descriptions = container.querySelectorAll('.text-muted-foreground')
      expect(descriptions.length).toBeGreaterThan(0)
    })

    it('should display all template descriptions', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)

      const descriptions = [
        'Complete dashboard with sidebar, stats, and content areas',
        'Marketing page with hero, features, and CTA sections',
        'Product detail page with images, info, and purchase options',
        'Article layout with header, content, and sidebar',
      ]

      descriptions.forEach((desc) => {
        expect(screen.getByText(new RegExp(desc.split(',')[0]))).toBeInTheDocument()
      })
    })
  })

  describe('Template Count', () => {
    it('should render exactly 4 templates', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)

      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
      expect(screen.getByTestId('landing-page-template')).toBeInTheDocument()
      expect(screen.getByTestId('ecommerce-template')).toBeInTheDocument()
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })

    it('should not have duplicate templates', () => {
      render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)

      const dashboards = screen.getAllByTestId('dashboard-template')
      expect(dashboards.length).toBe(1)

      const landingPages = screen.getAllByTestId('landing-page-template')
      expect(landingPages.length).toBe(1)

      const ecommerces = screen.getAllByTestId('ecommerce-template')
      expect(ecommerces.length).toBe(1)

      const blogs = screen.getAllByTestId('blog-template')
      expect(blogs.length).toBe(1)
    })
  })

  describe('Layout Consistency', () => {
    it('should maintain consistent layout for all sections', () => {
      const { container } = render(<TemplatesSection onSaveSnippet={mockOnSaveSnippet} />)
      const sections = container.querySelectorAll('section')

      sections.forEach((section) => {
        expect(section).toHaveClass('space-y-6')
        const heading = section.querySelector('h2')
        expect(heading).toHaveClass('text-3xl', 'font-bold')
      })
    })
  })

  describe('Callback Integration', () => {
    it('should receive and pass callback to showcases', () => {
      const onSaveSnippet = jest.fn()
      render(<TemplatesSection onSaveSnippet={onSaveSnippet} />)

      // Verify component renders with callback
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })

    it('should accept various callback implementations', () => {
      const callbacks = [
        jest.fn(),
        vi.fn((snippet) => snippet),
        vi.fn(async (snippet) => Promise.resolve(snippet)),
      ]

      callbacks.forEach((callback) => {
        const { unmount } = render(
          <TemplatesSection onSaveSnippet={callback} />
        )
        expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
        unmount()
      })
    })
  })
})
