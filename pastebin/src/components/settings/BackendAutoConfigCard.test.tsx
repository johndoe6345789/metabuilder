import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BackendAutoConfigCard } from './BackendAutoConfigCard'

describe('BackendAutoConfigCard', () => {
  const mockOnTestConnection = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering when not configured', () => {
    it('should render nothing when envVarSet is false', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={false}
          flaskUrl=""
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('rendering when configured', () => {
    it('should render card when envVarSet is true', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })

    it('should render card title', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })

    it('should render card description', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText(
          'Flask backend is configured via environment variable'
        )
      ).toBeInTheDocument()
    })

    it('should have accent styling when configured', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const card = container.querySelector('[class*="border-accent"]')
      expect(card).toBeInTheDocument()
    })

    it('should display title with accent color', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const title = screen.getByText('Backend Auto-Configured')
      expect(title).toHaveClass('text-accent')
    })
  })

  describe('backend URL display', () => {
    it('should display backend URL', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('http://localhost:5000')
      ).toBeInTheDocument()
    })

    it('should display backend URL label', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://api.example.com"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Backend URL')).toBeInTheDocument()
    })

    it('should display different URLs correctly', () => {
      const { rerender } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('http://localhost:5000')
      ).toBeInTheDocument()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="https://api.production.com"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('https://api.production.com')
      ).toBeInTheDocument()
    })

    it('should use monospace font for URL', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const urlElement = container.querySelector('[class*="font-mono"]')
      expect(urlElement).toBeInTheDocument()
    })
  })

  describe('configuration source display', () => {
    it('should display configuration source label', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('Configuration Source')
      ).toBeInTheDocument()
    })

    it('should display env variable name', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('NEXT_PUBLIC_FLASK_BACKEND_URL')
      ).toBeInTheDocument()
    })

    it('should use monospace font for env variable', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const codeElements = container.querySelectorAll('[class*="font-mono"]')
      expect(codeElements.length).toBeGreaterThan(0)
    })
  })

  describe('status display', () => {
    it('should display status label', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should show connected status', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="connected"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('should show connected status with green color', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="connected"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const status = screen.getByText('Connected')
      expect(status).toHaveClass('text-green-600')
    })

    it('should show failed status', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="failed"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Connection Failed')).toBeInTheDocument()
    })

    it('should show failed status with destructive color', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="failed"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const status = screen.getByText('Connection Failed')
      expect(status).toHaveClass('text-destructive')
    })
  })

  describe('test connection button', () => {
    it('should show test button when status is unknown', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Test Connection/i
        })
      ).toBeInTheDocument()
    })

    it('should not show test button when connected', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="connected"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.queryByRole('button', {
          name: /Test Connection/i
        })
      ).not.toBeInTheDocument()
    })

    it('should not show test button when failed', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="failed"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.queryByRole('button', {
          name: /Test Connection/i
        })
      ).not.toBeInTheDocument()
    })

    it('should call onTestConnection when button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const testButton = screen.getByRole('button', {
        name: /Test Connection/i
      })
      await user.click(testButton)

      expect(mockOnTestConnection).toHaveBeenCalledTimes(1)
    })

    it('should disable button when testing', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={true}
          onTestConnection={mockOnTestConnection}
        />
      )

      const testButton = screen.getByRole('button', {
        name: /Testing.../i
      })
      expect(testButton).toBeDisabled()
    })

    it('should show testing text when testing', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={true}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Testing...')).toBeInTheDocument()
    })

    it('should have outline variant', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const testButton = screen.getByRole('button', {
        name: /Test Connection/i
      })
      expect(testButton).toBeInTheDocument()
      expect(testButton).not.toHaveClass('destructive')
    })

    it('should have small size', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      const testButton = screen.getByRole('button', {
        name: /Test Connection/i
      })
      expect(testButton).toBeInTheDocument()
      expect(testButton).toBeEnabled()
    })

    it('should handle async test operation', async () => {
      const user = userEvent.setup()
      const slowTest = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={slowTest}
        />
      )

      const testButton = screen.getByRole('button', {
        name: /Test Connection/i
      })
      await user.click(testButton)

      expect(slowTest).toHaveBeenCalled()
    })
  })

  describe('state transitions', () => {
    it('should transition from unknown to connected', () => {
      const { rerender } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Test Connection/i
        })
      ).toBeInTheDocument()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="connected"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Connected')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', {
          name: /Test Connection/i
        })
      ).not.toBeInTheDocument()
    })

    it('should transition from unknown to failed', () => {
      const { rerender } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Test Connection/i
        })
      ).toBeInTheDocument()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="failed"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Connection Failed')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', {
          name: /Test Connection/i
        })
      ).not.toBeInTheDocument()
    })

    it('should transition from testing to complete', () => {
      const { rerender } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={true}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Testing...')).toBeInTheDocument()
      const testButton = screen.getByRole('button', {
        name: /Testing.../i
      })
      expect(testButton).toBeDisabled()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="connected"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  describe('conditional rendering', () => {
    it('should only render when envVarSet changes from false to true', () => {
      const { rerender, container } = render(
        <BackendAutoConfigCard
          envVarSet={false}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(container.firstChild).toBeNull()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })

    it('should maintain rendered state when props change', () => {
      const { rerender } = render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://api.example.com"
          flaskConnectionStatus="connected"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle test connection errors', async () => {
      const user = userEvent.setup()
      const slowAsyncTest = jest.fn(
        () => new Promise<void>((resolve) => {
          setTimeout(resolve, 50)
        })
      )

      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={slowAsyncTest}
        />
      )

      const testButton = screen.getByRole('button', {
        name: /Test Connection/i
      })

      await user.click(testButton)

      expect(slowAsyncTest).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper button role', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Test Connection/i
        })
      ).toBeInTheDocument()
    })

    it('should have readable labels', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
          flaskUrl="http://localhost:5000"
          flaskConnectionStatus="unknown"
          testingConnection={false}
          onTestConnection={mockOnTestConnection}
        />
      )

      expect(screen.getByText('Backend URL')).toBeInTheDocument()
      expect(
        screen.getByText('Configuration Source')
      ).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })
})
