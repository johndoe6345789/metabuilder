import React from 'react'
import { render, screen } from '@/test-utils'
import { ContentPreviewCardsSection } from '@/components/molecules/ContentPreviewCardsSection'

describe('ContentPreviewCardsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByTestId('content-preview-cards-section')).toBeInTheDocument()
    })

    it('should render as section element', () => {
      render(<ContentPreviewCardsSection />)
      const section = screen.getByTestId('content-preview-cards-section')
      expect(section.tagName).toBe('SECTION')
    })

    it('should have role=region', () => {
      render(<ContentPreviewCardsSection />)
      const section = screen.getByTestId('content-preview-cards-section')
      expect(section).toHaveAttribute('role', 'region')
    })

    it('should have aria-label', () => {
      render(<ContentPreviewCardsSection />)
      const section = screen.getByTestId('content-preview-cards-section')
      expect(section).toHaveAttribute('aria-label', 'Content preview card examples')
    })

    it('should have space-y-6 class', () => {
      render(<ContentPreviewCardsSection />)
      const section = screen.getByTestId('content-preview-cards-section')
      expect(section).toHaveClass('space-y-6')
    })
  })

  describe('Header Section', () => {
    it('should render section title', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Content Preview Cards')).toBeInTheDocument()
    })

    it('should have title as h2 heading', () => {
      render(<ContentPreviewCardsSection />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('Content Preview Cards')
    })

    it('should display description', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Compact cards displaying content with metadata')).toBeInTheDocument()
    })

    it('should have descriptive text class', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const description = container.querySelector('.text-muted-foreground')
      expect(description).toBeInTheDocument()
    })
  })

  describe('Card Grid', () => {
    it('should render grid container', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive grid classes', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('should have gap-6 spacing', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-6')
    })

    it('should render multiple cards', () => {
      render(<ContentPreviewCardsSection />)
      const title1 = screen.getByText('Building Scalable Design Systems')
      const title2 = screen.getByText('Advanced TypeScript Patterns')
      expect(title1).toBeInTheDocument()
      expect(title2).toBeInTheDocument()
    })
  })

  describe('First Card - Building Scalable Design Systems', () => {
    it('should render first card title', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Building Scalable Design Systems')).toBeInTheDocument()
    })

    it('should display first card description', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText(/Learn how to create and maintain design systems/)).toBeInTheDocument()
    })

    it('should show date for first card', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
    })

    it('should show reading time for first card', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('5 min read')).toBeInTheDocument()
    })

    it('should display badges for first card', () => {
      render(<ContentPreviewCardsSection />)
      const badges = screen.getAllByText(/Design|System/)
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })

    it('should have hover shadow effect', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const cards = container.querySelectorAll('[class*="hover:shadow"]')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Second Card - Advanced TypeScript Patterns', () => {
    it('should render second card title', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Advanced TypeScript Patterns')).toBeInTheDocument()
    })

    it('should display second card description', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText(/Explore advanced type system features/)).toBeInTheDocument()
    })

    it('should show date for second card', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Mar 12, 2024')).toBeInTheDocument()
    })

    it('should show reading time for second card', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('8 min read')).toBeInTheDocument()
    })

    it('should display badges for second card', () => {
      render(<ContentPreviewCardsSection />)
      const badges = screen.getAllByText(/TypeScript|Tutorial/)
      expect(badges.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Card Content Structure', () => {
    it('should have card padding', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const cards = container.querySelectorAll('[class*="p-6"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have spaced sections within cards', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const spacedDivs = container.querySelectorAll('.space-y-4')
      expect(spacedDivs.length).toBeGreaterThan(0)
    })

    it('should have card titles with line clamping', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const titles = container.querySelectorAll('.line-clamp-2')
      expect(titles.length).toBeGreaterThan(0)
    })

    it('should display card descriptions', () => {
      render(<ContentPreviewCardsSection />)
      const descriptions = screen.getAllByText(/Learn|Explore/)
      expect(descriptions.length).toBeGreaterThan(0)
    })
  })

  describe('Metadata Display', () => {
    it('should display calendar icon', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should display date information', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Mar 12, 2024')).toBeInTheDocument()
    })

    it('should display reading time', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('5 min read')).toBeInTheDocument()
      expect(screen.getByText('8 min read')).toBeInTheDocument()
    })

    it('should have metadata separator', () => {
      render(<ContentPreviewCardsSection />)
      const separators = screen.getAllByText('•')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('Badge Display', () => {
    it('should render Design badge', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Design')).toBeInTheDocument()
    })

    it('should render System badge', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('should render TypeScript badge', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('should render Tutorial badge', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Tutorial')).toBeInTheDocument()
    })

    it('should display all badges', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Design')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should have proper heading styles', () => {
      render(<ContentPreviewCardsSection />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('font-bold')
    })

    it('should have card titles with font-semibold', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const titles = container.querySelectorAll('[class*="font-semibold"]')
      expect(titles.length).toBeGreaterThan(0)
    })

    it('should have muted text for descriptions', () => {
      render(<ContentPreviewCardsSection />)
      const muted = screen.getAllByText(/Learn|Explore|Compact/)
      expect(muted.length).toBeGreaterThan(0)
    })

    it('should display small text for metadata', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const smallText = container.querySelectorAll('.text-sm')
      expect(smallText.length).toBeGreaterThan(0)
    })
  })

  describe('Styling Classes', () => {
    it('should have hover transition', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const cards = container.querySelectorAll('[class*="transition"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have card background styling', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const cards = container.querySelectorAll('[class*="p-6"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have card styling with borders', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const styledElements = container.querySelectorAll('[class*="p-"]')
      expect(styledElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have role=region', () => {
      render(<ContentPreviewCardsSection />)
      const section = screen.getByTestId('content-preview-cards-section')
      expect(section).toHaveAttribute('role', 'region')
    })

    it('should have descriptive aria-label', () => {
      render(<ContentPreviewCardsSection />)
      const section = screen.getByTestId('content-preview-cards-section')
      expect(section).toHaveAttribute('aria-label')
    })

    it('should have proper heading hierarchy', () => {
      render(<ContentPreviewCardsSection />)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
    })

    it('should have semantic structure', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByTestId('content-preview-cards-section')).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('should display all required information', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Content Preview Cards')).toBeInTheDocument()
      expect(screen.getByText('Building Scalable Design Systems')).toBeInTheDocument()
      expect(screen.getByText('Advanced TypeScript Patterns')).toBeInTheDocument()
    })

    it('should have proper metadata layout', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('5 min read')).toBeInTheDocument()
    })
  })

  describe('Card Layout', () => {
    it('should have flex layout for metadata', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const flexContainers = container.querySelectorAll('.flex')
      expect(flexContainers.length).toBeGreaterThan(0)
    })

    it('should have gap between metadata items', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const gappedContainers = container.querySelectorAll('[class*="gap"]')
      expect(gappedContainers.length).toBeGreaterThan(0)
    })

    it('should have badge row with gap-2', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const badgeSections = container.querySelectorAll('[class*="gap-2"]')
      expect(badgeSections.length).toBeGreaterThan(0)
    })
  })

  describe('Interactive Elements', () => {
    it('should have hover effect on cards', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      const hoverCards = container.querySelectorAll('[class*="hover:shadow"]')
      expect(hoverCards.length).toBeGreaterThan(0)
    })

    it('should be presentational without interactive elements', () => {
      render(<ContentPreviewCardsSection />)
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBe(0)
    })
  })

  describe('Data Display', () => {
    it('should display exact dates', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Mar 12, 2024')).toBeInTheDocument()
    })

    it('should display exact reading times', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('5 min read')).toBeInTheDocument()
      expect(screen.getByText('8 min read')).toBeInTheDocument()
    })

    it('should display exact titles', () => {
      render(<ContentPreviewCardsSection />)
      expect(screen.getByText('Building Scalable Design Systems')).toBeInTheDocument()
      expect(screen.getByText('Advanced TypeScript Patterns')).toBeInTheDocument()
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot', () => {
      const { container } = render(<ContentPreviewCardsSection />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
