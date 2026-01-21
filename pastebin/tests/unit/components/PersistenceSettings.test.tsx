import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { PersistenceSettings } from '@/components/demo/PersistenceSettings'
import { usePersistenceConfig } from '@/store/hooks'

// Mock the hook
jest.mock('@/store/hooks', () => ({
  usePersistenceConfig: jest.fn(),
}))

describe('PersistenceSettings Component', () => {
  const mockConfig = {
    enabled: true,
    logging: false,
    debounceMs: 100,
    actions: ['snippets/createSnippet', 'snippets/updateSnippet'],
    retryOnFailure: true,
    maxRetries: 3,
    retryDelayMs: 1000,
  }

  const mockTogglePersistence = jest.fn()
  const mockToggleLogging = jest.fn()
  const mockUpdateDebounceDelay = jest.fn()

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
    it('should render without crashing', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('should display the card title', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('should display the description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Automatic database synchronization for Redux state')).toBeInTheDocument()
    })

    it('should render Card component', () => {
      const { container } = render(<PersistenceSettings />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })
  })

  describe('Auto-Save Toggle', () => {
    it('should render Auto-Save Enabled toggle', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Auto-Save Enabled')).toBeInTheDocument()
    })

    it('should render Auto-Save description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Automatically sync Redux state changes to database')).toBeInTheDocument()
    })

    it('should render toggle switch for Auto-Save', () => {
      render(<PersistenceSettings />)
      const toggle = screen.getByRole('checkbox', { name: 'Auto-Save Enabled' })
      expect(toggle).toBeInTheDocument()
    })

    it('should reflect enabled state in toggle', () => {
      render(<PersistenceSettings />)
      const toggle = screen.getByRole('checkbox', { name: 'Auto-Save Enabled' }) as HTMLInputElement
      expect(toggle.checked).toBe(true)
    })

    it('should call togglePersistence when clicked', async () => {
      const user = userEvent.setup()
      render(<PersistenceSettings />)

      const toggle = screen.getByRole('checkbox', { name: 'Auto-Save Enabled' })
      await user.click(toggle)

      expect(mockTogglePersistence).toHaveBeenCalled()
    })
  })

  describe('Debug Logging Toggle', () => {
    it('should render Debug Logging toggle', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Debug Logging')).toBeInTheDocument()
    })

    it('should render Debug Logging description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Log persistence operations to console')).toBeInTheDocument()
    })

    it('should render toggle switch for Debug Logging', () => {
      render(<PersistenceSettings />)
      const toggle = screen.getByRole('checkbox', { name: /Debug Logging/ })
      expect(toggle).toBeInTheDocument()
    })

    it('should reflect logging state in toggle', () => {
      render(<PersistenceSettings />)
      const toggle = screen.getByRole('checkbox', { name: /Debug Logging/ }) as HTMLInputElement
      expect(toggle.checked).toBe(false)
    })

    it('should call toggleLogging when clicked', async () => {
      const user = userEvent.setup()
      render(<PersistenceSettings />)

      const toggle = screen.getByRole('checkbox', { name: /Debug Logging/ })
      await user.click(toggle)

      expect(mockToggleLogging).toHaveBeenCalled()
    })
  })

  describe('Save Delay Slider', () => {
    it('should render Save Delay label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Save Delay')).toBeInTheDocument()
    })

    it('should render debounce delay value badge', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
    })

    it('should render slider help text', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText(/Delay between rapid actions and database save/i)).toBeInTheDocument()
    })

    it('should render slider range information', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText(/0-1000ms/i)).toBeInTheDocument()
    })

    it('should update debounce value when slider changes', async () => {
      const user = userEvent.setup()
      render(<PersistenceSettings />)

      const slider = screen.getByRole('slider')
      await user.type(slider, '{ArrowRight}')

      expect(mockUpdateDebounceDelay).toHaveBeenCalled()
    })

    it('should disable slider when persistence is disabled', () => {
      ;(usePersistenceConfig as jest.Mock).mockReturnValue({
        config: { ...mockConfig, enabled: false },
        togglePersistence: mockTogglePersistence,
        toggleLogging: mockToggleLogging,
        updateDebounceDelay: mockUpdateDebounceDelay,
      })

      const { container } = render(<PersistenceSettings />)
      const slider = container.querySelector('[role="slider"][disabled]')
      expect(slider).toBeInTheDocument()
    })
  })

  describe('Monitored Actions Section', () => {
    it('should render Monitored Actions heading', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Monitored Actions')).toBeInTheDocument()
    })

    it('should display number of monitored actions', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should render action badges', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('createSnippet')).toBeInTheDocument()
      expect(screen.getByText('updateSnippet')).toBeInTheDocument()
    })

    it('should display all actions in config', () => {
      render(<PersistenceSettings />)
      const badges = screen.getAllByRole('generic')
      // Check if action names are visible
      expect(screen.getByText('createSnippet')).toBeInTheDocument()
      expect(screen.getByText('updateSnippet')).toBeInTheDocument()
    })
  })

  describe('Retry Settings Section', () => {
    it('should render Retry Settings heading', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Retry Settings')).toBeInTheDocument()
    })

    it('should display Retry on Failure label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Retry on Failure')).toBeInTheDocument()
    })

    it('should display Retry on Failure value', () => {
      render(<PersistenceSettings />)
      const yesLabels = screen.getAllByText('Yes')
      expect(yesLabels.length).toBeGreaterThan(0)
    })

    it('should display Max Retries label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Max Retries')).toBeInTheDocument()
    })

    it('should display Max Retries value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display Retry Delay label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Retry Delay')).toBeInTheDocument()
    })

    it('should display Retry Delay value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('1000ms')).toBeInTheDocument()
    })
  })

  describe('Configuration Display', () => {
    it('should display all configuration sections', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Auto-Save Enabled')).toBeInTheDocument()
      expect(screen.getByText('Debug Logging')).toBeInTheDocument()
      expect(screen.getByText('Save Delay')).toBeInTheDocument()
      expect(screen.getByText('Monitored Actions')).toBeInTheDocument()
      expect(screen.getByText('Retry Settings')).toBeInTheDocument()
    })

    it('should show current configuration values', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('1000ms')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible toggle switches', () => {
      render(<PersistenceSettings />)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should have labels associated with toggles', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Auto-Save Enabled')).toBeInTheDocument()
      expect(screen.getByText('Debug Logging')).toBeInTheDocument()
    })

    it('should have descriptive text for each setting', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Automatically sync Redux state changes to database')).toBeInTheDocument()
      expect(screen.getByText('Log persistence operations to console')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should have proper card structure', () => {
      const { container } = render(<PersistenceSettings />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })

    it('should have icon in header', () => {
      const { container } = render(<PersistenceSettings />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should have separators between sections', () => {
      const { container } = render(<PersistenceSettings />)
      const separators = container.querySelectorAll('[class*="border-t"]')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('Configuration State Management', () => {
    it('should use usePersistenceConfig hook', () => {
      render(<PersistenceSettings />)
      expect(usePersistenceConfig).toHaveBeenCalled()
    })

    it('should display hook return values', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should handle rendering with default config', () => {
      expect(() => {
        render(<PersistenceSettings />)
      }).not.toThrow()
    })

    it('should handle disabled state for slider', () => {
      ;(usePersistenceConfig as jest.Mock).mockReturnValue({
        config: { ...mockConfig, enabled: false },
        togglePersistence: mockTogglePersistence,
        toggleLogging: mockToggleLogging,
        updateDebounceDelay: mockUpdateDebounceDelay,
      })

      expect(() => {
        render(<PersistenceSettings />)
      }).not.toThrow()
    })
  })

  describe('Interactive Features', () => {
    it('should handle toggle interactions', async () => {
      const user = userEvent.setup()
      render(<PersistenceSettings />)

      const toggles = screen.getAllByRole('checkbox')
      for (const toggle of toggles) {
        await user.click(toggle)
      }

      expect(mockTogglePersistence).toHaveBeenCalled()
    })

    it('should handle slider interactions', async () => {
      const user = userEvent.setup()
      render(<PersistenceSettings />)

      const slider = screen.getByRole('slider')
      await user.type(slider, '{ArrowRight}')

      expect(mockUpdateDebounceDelay).toHaveBeenCalled()
    })
  })

  describe('Text Display', () => {
    it('should display millisecond values with ms suffix', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
      expect(screen.getByText('1000ms')).toBeInTheDocument()
    })

    it('should display boolean values as Yes/No', () => {
      render(<PersistenceSettings />)
      const yesText = screen.getAllByText('Yes')
      expect(yesText.length).toBeGreaterThan(0)
    })
  })
})
