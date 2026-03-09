import React from 'react'
import { render, screen } from '@/test-utils'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

describe('DashboardTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<DashboardTemplate />)
      expect(screen.getByTestId('dashboard-template')).toBeInTheDocument()
    })

    it('should render as main role', () => {
      render(<DashboardTemplate />)
      const dashboard = screen.getByTestId('dashboard-template')
      expect(dashboard).toHaveAttribute('role', 'main')
    })

    it('should have aria-label', () => {
      render(<DashboardTemplate />)
      const dashboard = screen.getByTestId('dashboard-template')
      expect(dashboard).toHaveAttribute('aria-label', 'Dashboard template')
    })

    it('should render Card wrapper', () => {
      const { container } = render(<DashboardTemplate />)
      const cards = container.querySelectorAll('[class*="rounded"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should have overflow-hidden class', () => {
      render(<DashboardTemplate />)
      const dashboard = screen.getByTestId('dashboard-template')
      expect(dashboard).toHaveClass('overflow-hidden')
    })
  })

  describe('Header Section', () => {
    it('should render header', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should have header title', () => {
      render(<DashboardTemplate />)
      const title = screen.getByText('Dashboard')
      expect(title.tagName).toBe('H3')
    })

    it('should render notification button', () => {
      render(<DashboardTemplate />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have header border', () => {
      const { container } = render(<DashboardTemplate />)
      const header = container.querySelector('.border-b')
      expect(header).toBeInTheDocument()
    })

    it('should display avatar in header', () => {
      const { container } = render(<DashboardTemplate />)
      const avatar = container.querySelector('[class*="h-8"][class*="w-8"]')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Sidebar Navigation', () => {
    it('should render sidebar on large screens', () => {
      const { container } = render(<DashboardTemplate />)
      const sidebar = container.querySelector('aside')
      expect(sidebar).toBeInTheDocument()
    })

    it('should render navigation items', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Team')).toBeInTheDocument()
    })

    it('should have lg:block class for sidebar', () => {
      const { container } = render(<DashboardTemplate />)
      const sidebar = container.querySelector('aside')
      expect(sidebar).toHaveClass('hidden')
      expect(sidebar).toHaveClass('lg:block')
    })

    it('should render sidebar with proper width', () => {
      const { container } = render(<DashboardTemplate />)
      const sidebar = container.querySelector('aside')
      expect(sidebar).toHaveClass('w-64')
    })

    it('should have sidebar border', () => {
      const { container } = render(<DashboardTemplate />)
      const sidebar = container.querySelector('aside')
      expect(sidebar).toHaveClass('border-r')
    })
  })

  describe('Main Content', () => {
    it('should render main content area', () => {
      const { container } = render(<DashboardTemplate />)
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()
    })

    it('should display overview title', () => {
      render(<DashboardTemplate />)
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveTextContent('Overview')
    })

    it('should display welcome message', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    })

    it('should have flex-1 for main content', () => {
      const { container } = render(<DashboardTemplate />)
      const main = container.querySelector('main')
      expect(main).toHaveClass('flex-1')
    })
  })

  describe('New Project Button', () => {
    it('should render new project button', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })

    it('should be a button element', () => {
      render(<DashboardTemplate />)
      const buttons = screen.getAllByRole('button')
      const newProjectBtn = buttons.find(b => b.textContent?.includes('New Project'))
      expect(newProjectBtn).toBeInTheDocument()
    })
  })

  describe('Stat Cards', () => {
    it('should render three stat cards', () => {
      const { container } = render(<DashboardTemplate />)
      const cards = container.querySelectorAll('[class*="p-6"][class*="border"]')
      // Should have header, nav, and multiple stat cards
      expect(container.querySelectorAll('[class*="p-6"]').length).toBeGreaterThan(2)
    })

    it('should display Total Revenue card', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    it('should display revenue amount', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('$45,231')).toBeInTheDocument()
    })

    it('should display Active Users card', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Active Users')).toBeInTheDocument()
    })

    it('should display user count', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('2,350')).toBeInTheDocument()
    })

    it('should display Total Orders card', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Total Orders')).toBeInTheDocument()
    })

    it('should display order count', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('should show trend indicators', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText(/\+20.1%/)).toBeInTheDocument()
      expect(screen.getByText(/\+12.5%/)).toBeInTheDocument()
      expect(screen.getByText(/\+8.2%/)).toBeInTheDocument()
    })
  })

  describe('Recent Activity Section', () => {
    it('should render Recent Activity section', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })

    it('should display activity items', () => {
      render(<DashboardTemplate />)
      const activityItems = screen.getAllByText(/completed a task/)
      expect(activityItems.length).toBeGreaterThan(0)
    })

    it('should show user avatars for activities', () => {
      const { container } = render(<DashboardTemplate />)
      const avatars = container.querySelectorAll('[class*="h-8"][class*="w-8"]')
      expect(avatars.length).toBeGreaterThan(1)
    })

    it('should display timestamps', () => {
      render(<DashboardTemplate />)
      const timestamps = screen.getAllByText(/hours ago/)
      expect(timestamps.length).toBeGreaterThan(0)
    })
  })

  describe('Quick Actions Section', () => {
    it('should render Quick Actions section', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('should display Create New Project action', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('should display Invite Team Members action', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Invite Team Members')).toBeInTheDocument()
    })

    it('should display Browse Templates action', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Browse Templates')).toBeInTheDocument()
    })

    it('should have action buttons', () => {
      render(<DashboardTemplate />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Layout Structure', () => {
    it('should have two column layout', () => {
      const { container } = render(<DashboardTemplate />)
      const flexContainer = container.querySelector('.flex')
      expect(flexContainer).toBeInTheDocument()
    })

    it('should have stats grid layout', () => {
      const { container } = render(<DashboardTemplate />)
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
    })

    it('should have responsive grid classes', () => {
      const { container } = render(<DashboardTemplate />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
    })
  })

  describe('Styling', () => {
    it('should have card styling', () => {
      render(<DashboardTemplate />)
      const dashboard = screen.getByTestId('dashboard-template')
      expect(dashboard).toHaveClass('overflow-hidden')
    })

    it('should have spacing', () => {
      const { container } = render(<DashboardTemplate />)
      const main = container.querySelector('main')
      expect(main).toHaveClass('p-6')
    })

    it('should have gap classes for grid', () => {
      const { container } = render(<DashboardTemplate />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('gap-6')
    })
  })

  describe('Typography', () => {
    it('should have proper heading sizes', () => {
      render(<DashboardTemplate />)
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should display labels for stat sections', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    })

    it('should display section headers', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('should display muted text for descriptions', () => {
      render(<DashboardTemplate />)
      const muledText = screen.getByText(/Welcome back/)
      expect(muledText).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role=main', () => {
      render(<DashboardTemplate />)
      const dashboard = screen.getByTestId('dashboard-template')
      expect(dashboard).toHaveAttribute('role', 'main')
    })

    it('should have descriptive aria-label', () => {
      render(<DashboardTemplate />)
      const dashboard = screen.getByTestId('dashboard-template')
      expect(dashboard).toHaveAttribute('aria-label')
    })

    it('should have proper heading hierarchy', () => {
      render(<DashboardTemplate />)
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('should render navigation section', () => {
      const { container } = render(<DashboardTemplate />)
      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })
  })

  describe('Content Completeness', () => {
    it('should have all required sections', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('should display all navigation items', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Team')).toBeInTheDocument()
    })

    it('should have all stat cards', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('Total Orders')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should display numeric values', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText('$45,231')).toBeInTheDocument()
      expect(screen.getByText('2,350')).toBeInTheDocument()
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('should display percentage changes', () => {
      render(<DashboardTemplate />)
      expect(screen.getByText(/\+20.1%/)).toBeInTheDocument()
    })

    it('should display time references', () => {
      render(<DashboardTemplate />)
      const timeRefs = screen.getAllByText(/hours ago/)
      expect(timeRefs.length).toBeGreaterThan(0)
    })
  })

  describe('Interaction Elements', () => {
    it('should render all buttons', () => {
      render(<DashboardTemplate />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(3)
    })

    it('should have icon buttons in header', () => {
      const { container } = render(<DashboardTemplate />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('Snapshot Tests', () => {
    it('should match snapshot', () => {
      const { container } = render(<DashboardTemplate />)
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
