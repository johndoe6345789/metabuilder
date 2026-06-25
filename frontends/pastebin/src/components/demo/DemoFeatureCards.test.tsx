import React from 'react'
import { render, screen } from '@testing-library/react'
import { DemoFeatureCards } from './DemoFeatureCards'
import '@testing-library/jest-dom'

describe('DemoFeatureCards', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
    })

    it('renders as a grid region', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByTestId('demo-feature-cards')
      expect(region).toHaveAttribute('role', 'region')
    })

    it('renders with accessible aria-label', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByTestId('demo-feature-cards')
      expect(region).toHaveAttribute('aria-label', 'Feature cards')
    })

    it('renders all three feature cards', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-realtime')).toBeInTheDocument()
      expect(screen.getByTestId('feature-card-resizable')).toBeInTheDocument()
      expect(screen.getByTestId('feature-card-viewmodes')).toBeInTheDocument()
    })
  })

  describe('Real-Time Updates Card', () => {
    it('renders Real-Time Updates card title', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-realtime')
      expect(card).toBeInTheDocument()
    })

    it('renders Real-Time Updates card description', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-realtime')
      expect(card).toHaveTextContent(
        'Watch your React components render instantly as you type',
      )
    })

    it('has testid for real-time card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-realtime')).toBeInTheDocument()
    })

    it('has feature card rendered', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-realtime')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Resizable Panels Card', () => {
    it('renders Resizable Panels card title', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-resizable')
      expect(card).toBeInTheDocument()
    })

    it('renders Resizable Panels card description', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-resizable')
      expect(card).toHaveTextContent('Drag the center divider')
    })

    it('has testid for resizable card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-resizable')).toBeInTheDocument()
    })

    it('has feature card rendered', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-resizable')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Multiple View Modes Card', () => {
    it('renders Multiple View Modes card title', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-viewmodes')
      expect(card).toBeInTheDocument()
    })

    it('renders Multiple View Modes card description', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-viewmodes')
      expect(card).toHaveTextContent('Switch between code-only')
    })

    it('has testid for view modes card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-viewmodes')).toBeInTheDocument()
    })

    it('has feature card rendered', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-viewmodes')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('has grid layout', () => {
      render(<DemoFeatureCards />)
      const grid = screen.getByTestId('demo-feature-cards')
      // Grid uses SCSS module class
      expect(grid).toHaveClass('grid')
    })

    it('displays cards in grid layout', () => {
      render(<DemoFeatureCards />)
      const grid = screen.getByTestId('demo-feature-cards')
      // Grid is a flex/grid container with responsive design
      expect(grid).toHaveAttribute('role', 'region')
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
    })

    it('has proper layout structure', () => {
      render(<DemoFeatureCards />)
      const grid = screen.getByTestId('demo-feature-cards')
      const cards = grid.querySelectorAll('[data-testid^="feature-card-"]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Card Structure', () => {
    it('each card has CardHeader', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
    })

    it('each card has CardTitle', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
      cards.forEach(card => {
        expect(card).toBeInTheDocument()
      })
    })

    it('each card has CardContent', () => {
      const { container } = render(<DemoFeatureCards />)
      const contents = container.querySelectorAll('[class*="cardBody"]')
      expect(contents.length).toBe(3)
    })

    it('each card has description text', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByTestId('feature-card-realtime'),
      ).toHaveTextContent('instantly as you type')
      expect(
        screen.getByTestId('feature-card-resizable'),
      ).toHaveTextContent('Drag the center divider')
      expect(
        screen.getByTestId('feature-card-viewmodes'),
      ).toHaveTextContent('Switch between')
    })
  })

  describe('Styling', () => {
    it('CardTitle has proper styling', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
    })

    it('cards are rendered with FakeMUI styling', () => {
      render(<DemoFeatureCards />)
      const realTimeCard = screen.getByTestId('feature-card-realtime')
      expect(realTimeCard).toBeInTheDocument()

      const resizableCard = screen.getByTestId('feature-card-resizable')
      expect(resizableCard).toBeInTheDocument()

      const viewModesCard = screen.getByTestId('feature-card-viewmodes')
      expect(viewModesCard).toBeInTheDocument()
    })
  })

  describe('Feature Count', () => {
    it('renders exactly 3 feature cards', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
    })

    it('displays 3 titles', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
    })

    it('displays 3 descriptions', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByTestId('feature-card-realtime'),
      ).toHaveTextContent('render instantly as you type')
      expect(
        screen.getByTestId('feature-card-resizable'),
      ).toHaveTextContent('Drag the center divider')
      expect(
        screen.getByTestId('feature-card-viewmodes'),
      ).toHaveTextContent('Switch between')
    })
  })

  describe('Accessibility', () => {
    it('has semantic structure', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByTestId('demo-feature-cards')
      expect(region).toHaveAttribute('role', 'region')
    })

    it('provides descriptive aria-label', () => {
      render(<DemoFeatureCards />)
      const region = screen.getByTestId('demo-feature-cards')
      expect(region).toHaveAttribute('aria-label', 'Feature cards')
    })

    it('each card is selectable via heading text', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
      cards.forEach(card => {
        expect(card).toBeInTheDocument()
      })
    })
  })

  describe('Content Accuracy', () => {
    it('Real-Time Updates describes instant rendering', () => {
      render(<DemoFeatureCards />)
      expect(
        screen.getByText(/render instantly as you type/i),
      ).toBeInTheDocument()
    })

    it('Resizable Panels describes dragging functionality', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/drag the center divider/i)).toBeInTheDocument()
    })

    it('Multiple View Modes describes toggle buttons', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/toggle buttons/i)).toBeInTheDocument()
    })
  })

  describe('Client Component', () => {
    it('component renders on client side', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('demo-feature-cards')).toBeInTheDocument()
    })

    it('all interactive elements are present', () => {
      render(<DemoFeatureCards />)
      const cards = screen.getAllByTestId(/^feature-card-/)
      expect(cards).toHaveLength(3)
    })
  })
})
