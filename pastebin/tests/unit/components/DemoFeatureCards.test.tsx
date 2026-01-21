import React from 'react'
import { render, screen } from '@/test-utils'
import { DemoFeatureCards } from '@/components/demo/DemoFeatureCards'

describe('DemoFeatureCards Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
    })

    it('should render with correct testid', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
    })

    it('should render with role region', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByRole('region')
      expect(region).toBeInTheDocument()
    })

    it('should have correct aria-label', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByRole('region', { name: 'Feature cards' })
      expect(region).toBeInTheDocument()
    })
  })

  describe('Card Content', () => {
    it('should render Real-Time Updates card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Real-Time Updates')).toBeInTheDocument()
    })

    it('should render Resizable Panels card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Resizable Panels')).toBeInTheDocument()
    })

    it('should render Multiple View Modes card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Multiple View Modes')).toBeInTheDocument()
    })

    it('should render Real-Time Updates description', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Watch your React components render instantly as you type/i)).toBeInTheDocument()
    })

    it('should render Resizable Panels description', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Drag the center divider to adjust the editor and preview panel sizes/i)).toBeInTheDocument()
    })

    it('should render Multiple View Modes description', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Switch between code-only, split-screen, or preview-only modes/i)).toBeInTheDocument()
    })
  })

  describe('Card Testids', () => {
    it('should render Real-Time Updates card with correct testid', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-realtime')).toBeInTheDocument()
    })

    it('should render Resizable Panels card with correct testid', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-resizable')).toBeInTheDocument()
    })

    it('should render Multiple View Modes card with correct testid', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-viewmodes')).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    it('should render 3 cards total', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/feature-card-/)
      expect(cards).toHaveLength(3)
    })

    it('should render cards with CardHeader', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Real-Time Updates')).toBeInTheDocument()
      expect(screen.getByText('Resizable Panels')).toBeInTheDocument()
      expect(screen.getByText('Multiple View Modes')).toBeInTheDocument()
    })

    it('should render cards with CardContent', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Watch your React components render instantly as you type/i)).toBeInTheDocument()
      expect(screen.getByText(/Drag the center divider to adjust the editor and preview panel sizes/i)).toBeInTheDocument()
      expect(screen.getByText(/Switch between code-only, split-screen, or preview-only modes/i)).toBeInTheDocument()
    })
  })

  describe('Card Styling', () => {
    it('should have border styling for first card', () => {
      const { container } = render(<DemoFeatureCards />)
      const firstCard = container.querySelector('[data-testid="feature-card-realtime"]')
      expect(firstCard?.className).toMatch(/border/)
    })

    it('should have border styling for second card', () => {
      const { container } = render(<DemoFeatureCards />)
      const secondCard = container.querySelector('[data-testid="feature-card-resizable"]')
      expect(secondCard?.className).toMatch(/border/)
    })

    it('should have border styling for third card', () => {
      const { container } = render(<DemoFeatureCards />)
      const thirdCard = container.querySelector('[data-testid="feature-card-viewmodes"]')
      expect(thirdCard?.className).toMatch(/border/)
    })
  })

  describe('Grid Layout', () => {
    it('should render with grid layout', () => {
      const { container } = render(<DemoFeatureCards />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid).toBeInTheDocument()
    })

    it('should have responsive grid columns', () => {
      const { container } = render(<DemoFeatureCards />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid?.className).toMatch(/grid-cols-/)
    })

    it('should have gap between cards', () => {
      const { container } = render(<DemoFeatureCards />)
      const grid = container.querySelector('[class*="gap"]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic region role', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByRole('region')
      expect(region).toBeInTheDocument()
    })

    it('should have descriptive aria-label', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByRole('region', { name: 'Feature cards' })
      expect(region).toBeInTheDocument()
    })

    it('should have headings for card titles', () => {
      render(<DemoFeatureCards />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThanOrEqual(3)
    })

    it('should render descriptive text for each card', () => {
      render(<DemoFeatureCards />)
      const descriptions = [
        /Watch your React components render instantly as you type/i,
        /Drag the center divider to adjust the editor and preview panel sizes/i,
        /Switch between code-only, split-screen, or preview-only modes/i,
      ]
      descriptions.forEach(desc => {
        expect(screen.getByText(desc)).toBeInTheDocument()
      })
    })
  })

  describe('Card Titles', () => {
    it('should render all card titles as headings', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Real-Time Updates')).toBeInTheDocument()
      expect(screen.getByText('Resizable Panels')).toBeInTheDocument()
      expect(screen.getByText('Multiple View Modes')).toBeInTheDocument()
    })

    it('should have text size lg for titles', () => {
      const { container } = render(<DemoFeatureCards />)
      // CardTitle should have text-lg class
      expect(container.innerHTML).toContain('Real-Time Updates')
      expect(container.innerHTML).toContain('Resizable Panels')
      expect(container.innerHTML).toContain('Multiple View Modes')
    })
  })

  describe('Description Text', () => {
    it('should have description for Real-Time Updates', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Watch your React components render instantly as you type/i)).toBeInTheDocument()
    })

    it('should have description for Resizable Panels', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Drag the center divider to adjust the editor and preview panel sizes/i)).toBeInTheDocument()
    })

    it('should have description for Multiple View Modes', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Switch between code-only, split-screen, or preview-only modes/i)).toBeInTheDocument()
    })

    it('should display descriptions with smaller text size', () => {
      const { container } = render(<DemoFeatureCards />)
      const smallTexts = container.querySelectorAll('[class*="text-sm"]')
      expect(smallTexts.length).toBeGreaterThan(0)
    })

    it('should display descriptions with muted foreground color', () => {
      const { container } = render(<DemoFeatureCards />)
      const mutedTexts = container.querySelectorAll('[class*="text-muted-foreground"]')
      expect(mutedTexts.length).toBeGreaterThan(0)
    })
  })

  describe('No Props Required', () => {
    it('should render with no props', () => {
      expect(() => {
        render(<DemoFeatureCards />)
      }).not.toThrow()
    })

    it('should be a purely presentational component', () => {
      const { rerender } = render(<DemoFeatureCards />)
      expect(() => {
        rerender(<DemoFeatureCards />)
      }).not.toThrow()
    })
  })

  describe('Component Integration', () => {
    it('should render complete feature cards section', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
      expect(screen.getByText('Real-Time Updates')).toBeInTheDocument()
      expect(screen.getByText('Resizable Panels')).toBeInTheDocument()
      expect(screen.getByText('Multiple View Modes')).toBeInTheDocument()
    })

    it('should have consistent card styling across all cards', () => {
      const { container } = render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/feature-card-/)
      cards.forEach(card => {
        expect(card.className).toMatch(/border/)
      })
    })
  })

  describe('Error States', () => {
    it('should render gracefully without errors', () => {
      expect(() => {
        render(<DemoFeatureCards />)
      }).not.toThrow()
    })

    it('should always display all three feature cards', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/feature-card-/)
      expect(cards).toHaveLength(3)
    })
  })

  describe('Content Completeness', () => {
    it('should render all required content', () => {
      render(<DemoFeatureCards />)

      // Check for all titles
      expect(screen.getByText('Real-Time Updates')).toBeInTheDocument()
      expect(screen.getByText('Resizable Panels')).toBeInTheDocument()
      expect(screen.getByText('Multiple View Modes')).toBeInTheDocument()

      // Check for all descriptions
      expect(screen.getByText(/Watch your React components render instantly as you type/i)).toBeInTheDocument()
      expect(screen.getByText(/Drag the center divider to adjust the editor and preview panel sizes/i)).toBeInTheDocument()
      expect(screen.getByText(/Switch between code-only, split-screen, or preview-only modes/i)).toBeInTheDocument()
    })
  })
})
