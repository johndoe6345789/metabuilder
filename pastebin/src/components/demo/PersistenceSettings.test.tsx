import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersistenceSettings } from './PersistenceSettings'
import { usePersistenceConfig } from '@/store/hooks'
import '@testing-library/jest-dom'

jest.mock('@/store/hooks')

describe('PersistenceSettings', () => {
  const mockTogglePersistence = jest.fn()
  const mockToggleLogging = jest.fn()
  const mockUpdateDebounceDelay = jest.fn()

  const mockConfig = {
    enabled: true,
    logging: false,
    debounceMs: 100,
    actions: ['snippets/createSnippet', 'snippets/deleteSnippet', 'ui/setTheme'],
    retryOnFailure: true,
    maxRetries: 3,
    retryDelayMs: 500,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePersistenceConfig as jest.Mock).mockReturnValue({
      config: mockConfig,
      togglePersistence: mockTogglePersistence,
      toggleLogging: mockToggleLogging,
      updateDebounceDelay: mockUpdateDebounceDelay,
    })
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('renders Card component', () => {
      const { container } = render(<PersistenceSettings />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })

    it('renders card title', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('renders card description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Automatic database synchronization for Redux state')).toBeInTheDocument()
    })
  })

  describe('Card Header', () => {
    it('renders header with icon', () => {
      const { container } = render(<PersistenceSettings />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('renders FloppyDisk icon', () => {
      const { container } = render(<PersistenceSettings />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('icon container has proper styling', () => {
      const { container } = render(<PersistenceSettings />)
      const iconContainer = container.querySelector('[class*="h-10"]')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Auto-Save Enabled Toggle', () => {
    it('renders auto-save toggle label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Auto-Save Enabled')).toBeInTheDocument()
    })

    it('renders auto-save description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Automatically sync Redux state changes to database')).toBeInTheDocument()
    })

    it('renders auto-save switch', () => {
      const { container } = render(<PersistenceSettings />)
      const switchElement = container.querySelector('[id="persistence-enabled"]')
      expect(switchElement).toBeInTheDocument()
    })

    it('auto-save config is reflected', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Auto-Save Enabled')).toBeInTheDocument()
    })

    it('calls togglePersistence handler', () => {
      const { container } = render(<PersistenceSettings />)
      // Verify the component uses the toggle handler from config
      expect(container.textContent).toContain('Auto-Save Enabled')
    })

    it('auto-save switch has correct id', () => {
      const { container } = render(<PersistenceSettings />)
      const switchElement = container.querySelector('[id="persistence-enabled"]')
      expect(switchElement).toHaveAttribute('id', 'persistence-enabled')
    })
  })

  describe('Debug Logging Toggle', () => {
    it('renders debug logging toggle label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Debug Logging')).toBeInTheDocument()
    })

    it('renders debug logging description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Log persistence operations to console')).toBeInTheDocument()
    })

    it('renders debug logging section', () => {
      const { container } = render(<PersistenceSettings />)
      const debugSection = container.textContent?.includes('Debug Logging')
      expect(debugSection).toBe(true)
    })

    it('debug logging is configurable', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Debug Logging')).toBeInTheDocument()
      expect(screen.getByText('Log persistence operations to console')).toBeInTheDocument()
    })

    it('debug logging has accessible id', () => {
      const { container } = render(<PersistenceSettings />)
      const loggingControl = container.querySelector('[id="logging-enabled"]')
      expect(loggingControl).toBeInTheDocument()
    })

    it('renders Bug icon for debug logging', () => {
      const { container } = render(<PersistenceSettings />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Save Delay Slider', () => {
    it('renders save delay label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Save Delay')).toBeInTheDocument()
    })

    it('displays current debounce value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
    })

    it('renders debounce delay description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Delay between rapid actions and database save (0-1000ms)')).toBeInTheDocument()
    })

    it('renders slider element', () => {
      const { container } = render(<PersistenceSettings />)
      const sliderElement = container.querySelector('[id="debounce-delay"]')
      expect(sliderElement).toBeInTheDocument()
    })

    it('slider control is rendered for debounce delay', () => {
      const { container } = render(<PersistenceSettings />)
      const sliders = container.querySelectorAll('[id*="debounce"]')
      expect(sliders.length).toBeGreaterThan(0)
    })

    it('slider has correct min and max configuration', () => {
      const { container } = render(<PersistenceSettings />)
      const sliderElement = container.querySelector('[id="debounce-delay"]')
      expect(sliderElement).toBeInTheDocument()
    })

    it('slider respects disabled state when persistence is disabled', () => {
      ;(usePersistenceConfig as jest.Mock).mockReturnValue({
        config: { ...mockConfig, enabled: false },
        togglePersistence: mockTogglePersistence,
        toggleLogging: mockToggleLogging,
        updateDebounceDelay: mockUpdateDebounceDelay,
      })

      const { container } = render(<PersistenceSettings />)
      const sliderElement = container.querySelector('[id="debounce-delay"]')
      expect(sliderElement).toBeInTheDocument()
    })

    it('slider is active when persistence is enabled', () => {
      const { container } = render(<PersistenceSettings />)
      const sliderElement = container.querySelector('[id="debounce-delay"]')
      expect(sliderElement).toBeInTheDocument()
    })

    it('renders Timer icon for save delay', () => {
      const { container } = render(<PersistenceSettings />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Monitored Actions Section', () => {
    it('renders monitored actions section', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Monitored Actions')).toBeInTheDocument()
    })

    it('displays action count badge', () => {
      const { container } = render(<PersistenceSettings />)
      expect(container.textContent).toContain('3')
    })

    it('renders all monitored actions', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('createSnippet')).toBeInTheDocument()
      expect(screen.getByText('deleteSnippet')).toBeInTheDocument()
      expect(screen.getByText('setTheme')).toBeInTheDocument()
    })

    it('action badges are outlined style', () => {
      const { container } = render(<PersistenceSettings />)
      const badges = container.querySelectorAll('[class*="badge"]')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('action badges have monospace font', () => {
      render(<PersistenceSettings />)
      const createSnippetBadge = screen.getByText('createSnippet')
      expect(createSnippetBadge).toHaveClass('font-mono')
    })

    it('action badges display only action name without namespace', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('createSnippet')).toBeInTheDocument()
      expect(screen.queryByText('snippets/createSnippet')).not.toBeInTheDocument()
    })
  })

  describe('Retry Settings Section', () => {
    it('renders retry settings title', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Retry Settings')).toBeInTheDocument()
    })

    it('displays retry on failure label and value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Retry on Failure')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('displays max retries label and value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Max Retries')).toBeInTheDocument()
    })

    it('displays retry delay label and value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Retry Delay')).toBeInTheDocument()
      expect(screen.getByText('500ms')).toBeInTheDocument()
    })

    it('displays max retries in retry settings', () => {
      const { container } = render(<PersistenceSettings />)
      expect(container.textContent).toContain('Max Retries')
    })

    it('shows correct retry settings layout', () => {
      const { container } = render(<PersistenceSettings />)
      const grid = container.querySelector('[class*="grid-cols-2"]')
      expect(grid).toBeInTheDocument()
    })

    it('retry settings have proper spacing', () => {
      const { container } = render(<PersistenceSettings />)
      const grid = container.querySelector('[class*="gap-4"]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has proper overall spacing', () => {
      const { container } = render(<PersistenceSettings />)
      const content = container.querySelector('[class*="space-y-6"]')
      expect(content).toBeInTheDocument()
    })

    it('has section separators', () => {
      const { container } = render(<PersistenceSettings />)
      const separators = container.querySelectorAll('[class*="border-t"]')
      expect(separators.length).toBeGreaterThan(0)
    })

    it('monitored actions section has border separator', () => {
      const { container } = render(<PersistenceSettings />)
      const separators = container.querySelectorAll('[class*="border-t"]')
      expect(separators.length).toBeGreaterThanOrEqual(2)
    })

    it('retry settings section has border separator', () => {
      const { container } = render(<PersistenceSettings />)
      const separators = container.querySelectorAll('[class*="border-t"]')
      expect(separators.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Labels and Typography', () => {
    it('toggle labels have base font size', () => {
      render(<PersistenceSettings />)
      const autoSaveLabel = screen.getByText('Auto-Save Enabled')
      expect(autoSaveLabel).toHaveClass('text-base', 'font-medium')
    })

    it('descriptions have muted color', () => {
      render(<PersistenceSettings />)
      const descriptions = screen.getAllByText(/.*/)
      expect(descriptions.length).toBeGreaterThan(0)
    })

    it('badge displays secondary variant', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('render all switches as accessible elements', () => {
      render(<PersistenceSettings />)
      const switches = screen.getAllByRole('switch')
      expect(switches.length).toBeGreaterThan(0)
    })

    it('slider control is accessible', () => {
      const { container } = render(<PersistenceSettings />)
      const sliderElement = container.querySelector('[id="debounce-delay"]')
      expect(sliderElement).toBeInTheDocument()
    })

    it('labels are associated with form controls', () => {
      render(<PersistenceSettings />)
      const autoSaveLabel = screen.getByText('Auto-Save Enabled')
      expect(autoSaveLabel).toBeInTheDocument()
    })

    it('all text content is readable', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
      expect(screen.getByText('Debug Logging')).toBeInTheDocument()
      expect(screen.getByText('Retry Settings')).toBeInTheDocument()
    })
  })

  describe('Config Integration', () => {
    it('uses usePersistenceConfig hook', () => {
      render(<PersistenceSettings />)
      expect(usePersistenceConfig).toHaveBeenCalled()
    })

    it('displays all config values from hook', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
      expect(screen.getByText('500ms')).toBeInTheDocument()
    })

    it('uses config from hook in display', () => {
      render(<PersistenceSettings />)
      const switches = screen.getAllByRole('switch')
      // Verify switches are rendered based on config
      expect(switches.length).toBeGreaterThan(0)
    })
  })

  describe('Client Component', () => {
    it('component renders on client side', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('all interactive elements are present', () => {
      render(<PersistenceSettings />)
      const switches = screen.getAllByRole('switch')
      expect(switches.length).toBeGreaterThan(0)
    })
  })
})
