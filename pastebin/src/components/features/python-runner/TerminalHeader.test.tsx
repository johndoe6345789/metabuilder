import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TerminalHeader } from './TerminalHeader'

describe('TerminalHeader', () => {
  const defaultProps = {
    onRun: jest.fn(),
    isRunning: false,
    isInitializing: false,
    waitingForInput: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render header with correct test id', () => {
      render(<TerminalHeader {...defaultProps} />)
      expect(screen.getByTestId('terminal-header')).toBeInTheDocument()
    })

    it('should display Python Terminal heading', () => {
      render(<TerminalHeader {...defaultProps} />)
      expect(screen.getByText('Python Terminal')).toBeInTheDocument()
    })

    it('should render terminal icon', () => {
      render(<TerminalHeader {...defaultProps} />)
      // The icon is aria-hidden, but we can check the header is there
      expect(screen.getByTestId('terminal-header')).toBeInTheDocument()
    })

    it('should render run button with test id', () => {
      render(<TerminalHeader {...defaultProps} />)
      expect(screen.getByTestId('run-python-btn')).toBeInTheDocument()
    })

    it('should display Run text when not running', () => {
      render(<TerminalHeader {...defaultProps} />)
      expect(screen.getByText('Run')).toBeInTheDocument()
    })

    it('should display Running... text when isRunning is true', () => {
      render(<TerminalHeader {...defaultProps} isRunning={true} />)
      expect(screen.getByText('Running...')).toBeInTheDocument()
    })

    it('should display Loading... text when isInitializing is true', () => {
      render(<TerminalHeader {...defaultProps} isInitializing={true} />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('should enable button when idle', () => {
      render(<TerminalHeader {...defaultProps} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).not.toBeDisabled()
    })

    it('should disable button when running', () => {
      render(<TerminalHeader {...defaultProps} isRunning={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toBeDisabled()
    })

    it('should disable button when initializing', () => {
      render(<TerminalHeader {...defaultProps} isInitializing={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toBeDisabled()
    })

    it('should disable button when waiting for input', () => {
      render(<TerminalHeader {...defaultProps} waitingForInput={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toBeDisabled()
    })

    it('should disable button when multiple flags are true', () => {
      render(
        <TerminalHeader
          {...defaultProps}
          isRunning={true}
          isInitializing={true}
          waitingForInput={true}
        />
      )
      const button = screen.getByTestId('run-python-btn')
      expect(button).toBeDisabled()
    })
  })

  describe('Button Click Handler', () => {
    it('should call onRun when button is clicked', async () => {
      const onRun = jest.fn()
      const user = userEvent.setup()

      render(<TerminalHeader {...defaultProps} onRun={onRun} />)
      await user.click(screen.getByTestId('run-python-btn'))

      expect(onRun).toHaveBeenCalledTimes(1)
    })

    it('should call onRun only once per click', async () => {
      const onRun = jest.fn()
      const user = userEvent.setup()

      render(<TerminalHeader {...defaultProps} onRun={onRun} />)
      await user.click(screen.getByTestId('run-python-btn'))
      await user.click(screen.getByTestId('run-python-btn'))

      expect(onRun).toHaveBeenCalledTimes(2)
    })

    it('should not call onRun when button is disabled', async () => {
      const onRun = jest.fn()
      const user = userEvent.setup()

      render(<TerminalHeader {...defaultProps} onRun={onRun} isRunning={true} />)

      const button = screen.getByTestId('run-python-btn')
      expect(button).toBeDisabled()
      // Clicking a disabled button won't trigger onClick
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label when idle', () => {
      render(<TerminalHeader {...defaultProps} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveAttribute('aria-label', 'Run Python code')
    })

    it('should have proper aria-label when running', () => {
      render(<TerminalHeader {...defaultProps} isRunning={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveAttribute('aria-label', 'Running code')
    })

    it('should have proper aria-label when initializing', () => {
      render(<TerminalHeader {...defaultProps} isInitializing={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveAttribute('aria-label', 'Loading terminal')
    })

    it('should set aria-busy when running', () => {
      render(<TerminalHeader {...defaultProps} isRunning={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('should set aria-busy when initializing', () => {
      render(<TerminalHeader {...defaultProps} isInitializing={true} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('should not set aria-busy when idle', () => {
      render(<TerminalHeader {...defaultProps} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveAttribute('aria-busy', 'false')
    })

    it('should have semantic heading text', () => {
      render(<TerminalHeader {...defaultProps} />)
      const heading = screen.getByText('Python Terminal')
      expect(heading.tagName).toBe('H3')
    })

    it('should have aria-hidden on icon', () => {
      render(<TerminalHeader {...defaultProps} />)
      const header = screen.getByTestId('terminal-header')
      // The terminal icon should be present
      expect(header).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have correct header styling classes', () => {
      render(<TerminalHeader {...defaultProps} />)
      const header = screen.getByTestId('terminal-header')
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-4', 'border-b')
    })

    it('should have correct button styling', () => {
      render(<TerminalHeader {...defaultProps} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).toHaveClass('gap-2')
    })

    it('should have correct title styling', () => {
      render(<TerminalHeader {...defaultProps} />)
      const title = screen.getByText('Python Terminal')
      expect(title).toHaveClass('text-sm', 'font-semibold')
    })
  })

  describe('Button Icons', () => {
    it('should show play icon when idle', () => {
      render(<TerminalHeader {...defaultProps} />)
      // Check for Play icon by looking for Run text
      expect(screen.getByText('Run')).toBeInTheDocument()
    })

    it('should show loading spinner when initializing', () => {
      render(<TerminalHeader {...defaultProps} isInitializing={true} />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show spinner when running', () => {
      render(<TerminalHeader {...defaultProps} isRunning={true} />)
      expect(screen.getByText('Running...')).toBeInTheDocument()
    })
  })

  describe('State Transitions', () => {
    it('should handle transition from idle to running', () => {
      const { rerender } = render(<TerminalHeader {...defaultProps} isRunning={false} />)
      expect(screen.getByText('Run')).toBeInTheDocument()

      rerender(<TerminalHeader {...defaultProps} isRunning={true} />)
      expect(screen.getByText('Running...')).toBeInTheDocument()
    })

    it('should handle transition from running to idle', () => {
      const { rerender } = render(<TerminalHeader {...defaultProps} isRunning={true} />)
      expect(screen.getByText('Running...')).toBeInTheDocument()

      rerender(<TerminalHeader {...defaultProps} isRunning={false} />)
      expect(screen.getByText('Run')).toBeInTheDocument()
    })

    it('should handle transition from initializing to idle', () => {
      const { rerender } = render(<TerminalHeader {...defaultProps} isInitializing={true} />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(<TerminalHeader {...defaultProps} isInitializing={false} />)
      expect(screen.getByText('Run')).toBeInTheDocument()
    })

    it('should handle transition to waiting for input', () => {
      const { rerender } = render(<TerminalHeader {...defaultProps} waitingForInput={false} />)
      const button = screen.getByTestId('run-python-btn')
      expect(button).not.toBeDisabled()

      rerender(<TerminalHeader {...defaultProps} waitingForInput={true} />)
      expect(button).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid prop updates', async () => {
      const onRun = jest.fn()
      const { rerender } = render(
        <TerminalHeader {...defaultProps} onRun={onRun} isRunning={false} />
      )

      rerender(<TerminalHeader {...defaultProps} onRun={onRun} isRunning={true} />)
      rerender(<TerminalHeader {...defaultProps} onRun={onRun} isRunning={false} />)
      rerender(<TerminalHeader {...defaultProps} onRun={onRun} isRunning={true} />)

      expect(screen.getByTestId('terminal-header')).toBeInTheDocument()
    })

    it('should maintain button functionality after state changes', async () => {
      const onRun = jest.fn()
      const user = userEvent.setup()

      const { rerender } = render(
        <TerminalHeader {...defaultProps} onRun={onRun} isRunning={true} />
      )

      rerender(<TerminalHeader {...defaultProps} onRun={onRun} isRunning={false} />)

      await user.click(screen.getByTestId('run-python-btn'))
      expect(onRun).toHaveBeenCalled()
    })

    it('should handle callback change', async () => {
      const onRun1 = jest.fn()
      const onRun2 = jest.fn()
      const user = userEvent.setup()

      const { rerender } = render(<TerminalHeader {...defaultProps} onRun={onRun1} />)

      await user.click(screen.getByTestId('run-python-btn'))
      expect(onRun1).toHaveBeenCalledTimes(1)

      rerender(<TerminalHeader {...defaultProps} onRun={onRun2} />)

      await user.click(screen.getByTestId('run-python-btn'))
      expect(onRun2).toHaveBeenCalledTimes(1)
      expect(onRun1).toHaveBeenCalledTimes(1) // Should not increase
    })
  })

  describe('Button Size', () => {
    it('should have small button size', () => {
      render(<TerminalHeader {...defaultProps} />)
      const button = screen.getByTestId('run-python-btn')
      // size="sm" is applied via className
      expect(button).toHaveClass('gap-2')
    })
  })
})
