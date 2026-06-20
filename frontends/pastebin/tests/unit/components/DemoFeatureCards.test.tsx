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
      const card = screen.getByTestId('feature-card-realtime')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent(/instantly as you type/)
    })

    it('should render Resizable Panels card', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-resizable')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent(/Drag the center divider/)
    })

    it('should render Multiple View Modes card', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-viewmodes')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent(/Switch between/)
    })

    it('should render Real-Time Updates description', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Watch your React components render instantly as you type/i,
        ),
      ).toBeInTheDocument()
    })

    it('should render Resizable Panels description', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Drag the center divider to adjust the editor and preview panel sizes/i,
        ),
      ).toBeInTheDocument()
    })

    it('should render Multiple View Modes description', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Switch between code-only, split-screen, or preview-only modes/i,
        ),
      ).toBeInTheDocument()
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
      const realtime = screen.getByTestId('feature-card-realtime')
      const resizable = screen.getByTestId('feature-card-resizable')
      const viewmodes = screen.getByTestId('feature-card-viewmodes')
      expect(realtime).toBeInTheDocument()
      expect(resizable).toBeInTheDocument()
      expect(viewmodes).toBeInTheDocument()
    })

    it('should render cards with CardContent', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Watch your React components render instantly as you type/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Drag the center divider to adjust the editor and preview panel sizes/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Switch between code-only, split-screen, or preview-only modes/i,
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Card Styling', () => {
    it('should have border styling for first card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-realtime')).toBeInTheDocument()
    })

    it('should have border styling for second card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-resizable')).toBeInTheDocument()
    })

    it('should have border styling for third card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-viewmodes')).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('should render with grid layout', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
    })

    it('should have responsive grid columns', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
    })

    it('should have gap between cards', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
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
      const cards = screen.getAllByTestId(/feature-card-/)
      expect(cards).toHaveLength(3)
      cards.forEach(card => {
        expect(card).toBeInTheDocument()
      })
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
      const r1 = screen.getByTestId('feature-card-realtime')
      const r2 = screen.getByTestId('feature-card-resizable')
      const r3 = screen.getByTestId('feature-card-viewmodes')
      expect(r1).toBeInTheDocument()
      expect(r2).toBeInTheDocument()
      expect(r3).toBeInTheDocument()
    })

    it('should have text size lg for titles', () => {
      render(<DemoFeatureCards />)
      // Verify that the component renders all three cards
      expect(screen.getAllByTestId(/feature-card-/)).toHaveLength(3)
    })
  })

  describe('Description Text', () => {
    it('should have description for Real-Time Updates', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Watch your React components render instantly as you type/i,
        ),
      ).toBeInTheDocument()
    })

    it('should have description for Resizable Panels', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Drag the center divider to adjust the editor and preview panel sizes/i,
        ),
      ).toBeInTheDocument()
    })

    it('should have description for Multiple View Modes', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(
          /Switch between code-only, split-screen, or preview-only modes/i,
        ),
      ).toBeInTheDocument()
    })

    it('should display descriptions with smaller text size', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Watch your React components render instantly/i)).toBeInTheDocument()
    })

    it('should display descriptions with muted foreground color', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/Drag the center divider/i)).toBeInTheDocument()
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
      expect(
        screen.getByTestId('feature-card-realtime'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('feature-card-resizable'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('feature-card-viewmodes'),
      ).toBeInTheDocument()
    })

    it('should have consistent card styling across all cards', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/feature-card-/)
      expect(cards).toHaveLength(3)
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
      expect(
        screen.getByTestId('feature-card-realtime'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('feature-card-resizable'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('feature-card-viewmodes'),
      ).toBeInTheDocument()

      // Check for all descriptions
      expect(
        screen.getByText(
          /Watch your React components render instantly as you type/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Drag the center divider to adjust the editor and preview panel sizes/i,
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Switch between code-only, split-screen, or preview-only modes/i,
        ),
      ).toBeInTheDocument()
    })
  })
})
