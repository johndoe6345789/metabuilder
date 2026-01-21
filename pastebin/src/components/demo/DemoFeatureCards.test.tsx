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
      expect(screen.getByText('Real-Time Updates')).toBeInTheDocument()
    })

    it('renders Real-Time Updates card description', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Watch your React components render instantly as you type. No refresh needed.')).toBeInTheDocument()
    })

    it('has testid for real-time card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-realtime')).toBeInTheDocument()
    })

    it('applies primary border color', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-realtime')
      expect(card).toHaveClass('border-primary/20')
    })
  })

  describe('Resizable Panels Card', () => {
    it('renders Resizable Panels card title', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Resizable Panels')).toBeInTheDocument()
    })

    it('renders Resizable Panels card description', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Drag the center divider to adjust the editor and preview panel sizes to your preference.')).toBeInTheDocument()
    })

    it('has testid for resizable card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-resizable')).toBeInTheDocument()
    })

    it('applies accent border color', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-resizable')
      expect(card).toHaveClass('border-accent/20')
    })
  })

  describe('Multiple View Modes Card', () => {
    it('renders Multiple View Modes card title', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Multiple View Modes')).toBeInTheDocument()
    })

    it('renders Multiple View Modes card description', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText('Switch between code-only, split-screen, or preview-only modes with the toggle buttons.')).toBeInTheDocument()
    })

    it('has testid for view modes card', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByTestId('feature-card-viewmodes')).toBeInTheDocument()
    })

    it('applies primary border color', () => {
      render(<DemoFeatureCards />)
      const card = screen.getByTestId('feature-card-viewmodes')
      expect(card).toHaveClass('border-primary/20')
    })
  })

  describe('Grid Layout', () => {
    it('has grid layout class', () => {
      render(<DemoFeatureCards />)
      const grid = screen.getByTestId('demo-feature-cards')
      expect(grid).toHaveClass('grid')
    })

    it('has responsive grid columns', () => {
      render(<DemoFeatureCards />)
      const grid = screen.getByTestId('demo-feature-cards')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3')
    })

    it('has proper gap spacing', () => {
      render(<DemoFeatureCards />)
      const grid = screen.getByTestId('demo-feature-cards')
      expect(grid).toHaveClass('gap-6')
    })
  })

  describe('Card Structure', () => {
    it('each card has CardHeader', () => {
      const { container } = render(<DemoFeatureCards />)
      const cardHeaders = container.querySelectorAll('[class*="border"]')
      expect(cardHeaders.length).toBeGreaterThan(0)
    })

    it('each card has CardTitle', () => {
      render(<DemoFeatureCards />)
      const titles = ['Real-Time Updates', 'Resizable Panels', 'Multiple View Modes']
      titles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument()
      })
    })

    it('each card has CardContent with text-sm', () => {
      const { container } = render(<DemoFeatureCards />)
      const contents = container.querySelectorAll('[class*="text-sm"]')
      expect(contents.length).toBeGreaterThan(0)
    })

    it('each card has muted foreground text', () => {
      const { container } = render(<DemoFeatureCards />)
      const mutedTexts = container.querySelectorAll('[class*="text-muted-foreground"]')
      expect(mutedTexts.length).toBeGreaterThan(0)
    })
  })

  describe('Styling', () => {
    it('CardTitle has text-lg class', () => {
      const { container } = render(<DemoFeatureCards />)
      const titles = container.querySelectorAll('[class*="text-lg"]')
      expect(titles.length).toBeGreaterThan(0)
    })

    it('border opacity is 20%', () => {
      render(<DemoFeatureCards />)
      const realTimeCard = screen.getByTestId('feature-card-realtime')
      expect(realTimeCard).toHaveClass('border-primary/20')

      const resizableCard = screen.getByTestId('feature-card-resizable')
      expect(resizableCard).toHaveClass('border-accent/20')

      const viewModesCard = screen.getByTestId('feature-card-viewmodes')
      expect(viewModesCard).toHaveClass('border-primary/20')
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
      const titles = ['Real-Time Updates', 'Resizable Panels', 'Multiple View Modes']
      titles.forEach((title) => {
        expect(screen.getByText(title)).toBeInTheDocument()
      })
    })

    it('displays 3 descriptions', () => {
      render(<DemoFeatureCards />)
      const descriptions = [
        'Watch your React components render instantly as you type. No refresh needed.',
        'Drag the center divider to adjust the editor and preview panel sizes to your preference.',
        'Switch between code-only, split-screen, or preview-only modes with the toggle buttons.',
      ]
      descriptions.forEach((description) => {
        expect(screen.getByText(description)).toBeInTheDocument()
      })
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
      const title1 = screen.getByText('Real-Time Updates')
      const title2 = screen.getByText('Resizable Panels')
      const title3 = screen.getByText('Multiple View Modes')

      expect(title1).toBeInTheDocument()
      expect(title2).toBeInTheDocument()
      expect(title3).toBeInTheDocument()
    })
  })

  describe('Content Accuracy', () => {
    it('Real-Time Updates describes instant rendering', () => {
      render(<DemoFeatureCards />)
      expect(screen.getByText(/render instantly as you type/i)).toBeInTheDocument()
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
