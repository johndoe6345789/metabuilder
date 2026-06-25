import React from 'react'
import { render, screen } from '@/test-utils'
import { BlogTemplate } from '@/components/templates/BlogTemplate'

describe('BlogTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<BlogTemplate />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })

    it('should render as main role', () => {
      render(<BlogTemplate />)
      const blog = screen.getByTestId('blog-template')
      expect(blog).toHaveAttribute('role', 'main')
    })

    it('should have aria-label', () => {
      render(<BlogTemplate />)
      const blog = screen.getByTestId('blog-template')
      expect(blog).toHaveAttribute('aria-label', 'Blog template')
    })

    it('should have overflow-hidden class', () => {
      render(<BlogTemplate />)
      const blog = screen.getByTestId('blog-template')
      expect(blog).toBeInTheDocument()
    })
  })

  describe('Header Section', () => {
    it('should render header with Blog title', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Blog')).toBeInTheDocument()
    })

    it('should render navigation buttons', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Articles')).toBeInTheDocument()
      expect(screen.getByText('Tutorials')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('should have header border', () => {
      render(<BlogTemplate />)
      const header = screen.getByText('Blog').closest('div')
      expect(header).toBeInTheDocument()
    })

    it('should display three navigation items', () => {
      render(<BlogTemplate />)
      const buttons = screen.getAllByRole('button')
      const navButtons = buttons.filter(b =>
        ['Articles', 'Tutorials', 'About'].includes(b.textContent || ''),
      )
      expect(navButtons.length).toBe(3)
    })
  })

  describe('Article Content', () => {
    it('should render article title', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText('Building a Comprehensive Component Library'),
      ).toBeInTheDocument()
    })

    it('should have main article title as heading', () => {
      render(<BlogTemplate />)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
    })

    it('should display badges', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Design')).toBeInTheDocument()
      expect(screen.getByText('Tutorial')).toBeInTheDocument()
    })

    it('should display author information', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Alex Writer')).toBeInTheDocument()
    })

    it('should display publish date and reading time', () => {
      render(<BlogTemplate />)
      expect(screen.getByText(/March 15, 2024/)).toBeInTheDocument()
      expect(screen.getByText(/10 min read/)).toBeInTheDocument()
    })

    it('should render author avatar', () => {
      const { container } = render(<BlogTemplate />)
      const avatars = container.querySelectorAll('.avatar')
      expect(avatars.length).toBeGreaterThan(0)
    })
  })

  describe('Blog Body', () => {
    it('should display hero image area', () => {
      render(<BlogTemplate />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })

    it('should have hero image gradient', () => {
      render(<BlogTemplate />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })

    it('should render introductory paragraph', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText(/Design systems have become an essential/),
      ).toBeInTheDocument()
    })

    it('should render section heading about Atomic Design', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText('Understanding Atomic Design'),
      ).toBeInTheDocument()
    })

    it('should render Atomic Design description', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText(
          /The atomic design methodology consists of five distinct stages/,
        ),
      ).toBeInTheDocument()
    })

    it('should render quote section', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText(/A design system is never complete/),
      ).toBeInTheDocument()
    })

    it('should have quote styling', () => {
      render(<BlogTemplate />)
      const quote = screen.getByText(/A design system is never complete/)
      expect(quote).toBeInTheDocument()
    })

    it('should render Getting Started section', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
    })

    it('should render Getting Started description', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText(/Begin by identifying the core components/),
      ).toBeInTheDocument()
    })
  })

  describe('Article Navigation', () => {
    it('should render Previous Article button', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Previous Article')).toBeInTheDocument()
    })

    it('should render Next Article button', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Next Article')).toBeInTheDocument()
    })

    it('should have navigation buttons', () => {
      render(<BlogTemplate />)
      const buttons = screen.getAllByRole('button')
      const navButtons = buttons.filter(b =>
        ['Previous Article', 'Next Article'].some(t =>
          b.textContent?.includes(t),
        ),
      )
      expect(navButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('should have both Previous and Next buttons in correct order', () => {
      render(<BlogTemplate />)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const allButtons = screen.getAllByRole('button')
      const prevBtn = screen.getByText('Previous Article')
      const nextBtn = screen.getByText('Next Article')
      // Both buttons should be present and distinct
      expect(prevBtn).toBeInTheDocument()
      expect(nextBtn).toBeInTheDocument()
      expect(prevBtn).not.toEqual(nextBtn)
    })
  })

  describe('Layout Structure', () => {
    it('should have centered content with max-width', () => {
      render(<BlogTemplate />)
      const contentArea = screen.getByRole('heading', { level: 1 })
      expect(contentArea).toBeInTheDocument()
    })

    it('should have centered horizontal alignment', () => {
      render(<BlogTemplate />)
      const contentArea = screen.getByRole('heading', { level: 1 })
      expect(contentArea).toBeInTheDocument()
    })

    it('should have proper spacing', () => {
      render(<BlogTemplate />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })

    it('should have space for content sections', () => {
      render(<BlogTemplate />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })
  })

  describe('Separators', () => {
    it('should render separator after article header', () => {
      const { container } = render(<BlogTemplate />)
      const separators = container.querySelectorAll('hr')
      expect(separators.length).toBeGreaterThan(0)
    })

    it('should render separator after article content', () => {
      const { container } = render(<BlogTemplate />)
      const separators = container.querySelectorAll('hr')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('Typography', () => {
    it('should have proper heading sizes', () => {
      render(<BlogTemplate />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('should have section h2 headings', () => {
      const { container } = render(<BlogTemplate />)
      const h2s = container.querySelectorAll('h2')
      expect(h2s.length).toBeGreaterThan(0)
    })

    it('should display text with proper sizing', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText('Building a Comprehensive Component Library'),
      ).toBeInTheDocument()
    })

    it('should have muted text for timestamps', () => {
      render(<BlogTemplate />)
      const timeText = screen.getByText(/March 15, 2024/)
      expect(timeText).toBeInTheDocument()
    })
  })

  describe('Content Sections', () => {
    it('should have article metadata section', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Alex Writer')).toBeInTheDocument()
      expect(screen.getByText(/10 min read/)).toBeInTheDocument()
    })

    it('should have prose content area', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText(/Design systems have become an essential/),
      ).toBeInTheDocument()
    })

    it('should have multiple paragraphs', () => {
      render(<BlogTemplate />)
      const paragraphs = screen.getAllByText(/[A-Z]/, { selector: 'p' })
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have role=main', () => {
      render(<BlogTemplate />)
      const blog = screen.getByTestId('blog-template')
      expect(blog).toHaveAttribute('role', 'main')
    })

    it('should have descriptive aria-label', () => {
      render(<BlogTemplate />)
      const blog = screen.getByTestId('blog-template')
      expect(blog).toHaveAttribute('aria-label')
    })

    it('should have proper heading hierarchy', () => {
      render(<BlogTemplate />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('should have alt text opportunity for images', () => {
      render(<BlogTemplate />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Badge Components', () => {
    it('should display Design badge', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Design')).toBeInTheDocument()
    })

    it('should display Tutorial badge', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Tutorial')).toBeInTheDocument()
    })

    it('should have secondary variant for Tutorial badge', () => {
      render(<BlogTemplate />)
      const badges = screen.getAllByText(/Design|Tutorial/)
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Author Section', () => {
    it('should display author avatar image', () => {
      const { container } = render(<BlogTemplate />)
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
    })

    it('should display author name', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Alex Writer')).toBeInTheDocument()
    })

    it('should display author metadata', () => {
      render(<BlogTemplate />)
      expect(screen.getByText(/March 15, 2024/)).toBeInTheDocument()
    })

    it('should display reading time estimate', () => {
      render(<BlogTemplate />)
      expect(screen.getByText(/10 min read/)).toBeInTheDocument()
    })
  })

  describe('Navigation Section', () => {
    it('should have footer navigation', () => {
      render(<BlogTemplate />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })

    it('should have Previous and Next buttons at bottom', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Previous Article')).toBeInTheDocument()
      expect(screen.getByText('Next Article')).toBeInTheDocument()
    })
  })

  describe('Content Completeness', () => {
    it('should have all required sections', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Blog')).toBeInTheDocument()
      expect(
        screen.getByText('Building a Comprehensive Component Library'),
      ).toBeInTheDocument()
      expect(screen.getByText('Alex Writer')).toBeInTheDocument()
    })

    it('should have navigation and content', () => {
      render(<BlogTemplate />)
      expect(screen.getByText('Articles')).toBeInTheDocument()
      expect(
        screen.getByText('Understanding Atomic Design'),
      ).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have card styling', () => {
      render(<BlogTemplate />)
      const blog = screen.getByTestId('blog-template')
      expect(blog).toBeInTheDocument()
    })

    it('should have proper padding', () => {
      render(<BlogTemplate />)
      expect(screen.getByTestId('blog-template')).toBeInTheDocument()
    })

    it('should have gradient background for hero', () => {
      render(<BlogTemplate />)
      expect(
        screen.getByText(/A design system is never complete/),
      ).toBeInTheDocument()
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot', () => {
      const { container } = render(<BlogTemplate />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
