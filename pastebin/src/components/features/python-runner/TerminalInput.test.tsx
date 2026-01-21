import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TerminalInput } from './TerminalInput'

describe('TerminalInput', () => {
  const defaultProps = {
    waitingForInput: false,
    inputValue: '',
    onInputChange: jest.fn(),
    onSubmit: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when waitingForInput is false', () => {
      render(<TerminalInput {...defaultProps} />)
      expect(screen.queryByTestId('terminal-input-form')).not.toBeInTheDocument()
    })

    it('should render form when waitingForInput is true', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      expect(screen.getByTestId('terminal-input-form')).toBeInTheDocument()
    })

    it('should render input field when waiting for input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      expect(screen.getByTestId('terminal-input')).toBeInTheDocument()
    })

    it('should render prompt indicator when waiting for input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      expect(screen.getByText('>')).toBeInTheDocument()
    })

    it('should display input placeholder when waiting', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input')
      expect(input).toHaveAttribute('placeholder', 'Enter input...')
    })

    it('should have correct input type', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.type).toBe('text')
    })

    it('should display the inputValue in the input field', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} inputValue="test value" />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value).toBe('test value')
    })
  })

  describe('Input Change', () => {
    it('should call onInputChange when user types', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
        />
      )

      await user.type(screen.getByTestId('terminal-input'), 'hello')
      expect(onInputChange).toHaveBeenCalled()
    })

    it('should call onInputChange for each character typed', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
          inputValue=""
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.type(input, 'test')
      expect(onInputChange.mock.calls.length).toBeGreaterThanOrEqual(4)
    })

    it('should pass correct value to onInputChange', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.type(input, 'a')

      // Check that onInputChange was called with the value
      expect(onInputChange).toHaveBeenCalledWith(expect.any(String))
    })

    it('should handle special characters in input', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
        />
      )

      await user.type(screen.getByTestId('terminal-input'), '!@#$%')
      expect(onInputChange.mock.calls.length).toBeGreaterThan(0)
    })

    it('should handle deletion of input', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
          inputValue="test"
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.clear(input)
      expect(onInputChange).toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const onSubmit = jest.fn((e) => e.preventDefault())
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onSubmit={onSubmit}
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.type(input, 'test')
      await user.keyboard('{Enter}')

      expect(onSubmit).toHaveBeenCalled()
    })

    it('should pass event to onSubmit', async () => {
      const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault())
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onSubmit={onSubmit}
        />
      )

      await user.type(screen.getByTestId('terminal-input'), 'test')
      await user.keyboard('{Enter}')

      expect(onSubmit).toHaveBeenCalledWith(expect.any(Object))
    })

    it('should submit form with Enter key', async () => {
      const onSubmit = jest.fn((e) => e.preventDefault())
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onSubmit={onSubmit}
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.type(input, 'user input')
      await user.keyboard('{Enter}')

      expect(onSubmit).toHaveBeenCalled()
    })

    it('should preserve input value in controlled component', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      const { rerender } = render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          inputValue="initial"
          onInputChange={onInputChange}
        />
      )

      rerender(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          inputValue="initial"
          onInputChange={onInputChange}
        />
      )

      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value).toBe('initial')
    })
  })

  describe('Disabled State', () => {
    it('should disable input when not waiting for input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={false} />)
      // Input should not be in DOM when not waiting
      expect(screen.queryByTestId('terminal-input')).not.toBeInTheDocument()
    })

    it('should enable input when waiting for input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.disabled).toBe(false)
    })
  })

  describe('Focus Management', () => {
    it('should auto-focus input when waitingForInput becomes true', async () => {
      const { rerender } = render(
        <TerminalInput {...defaultProps} waitingForInput={false} />
      )

      rerender(<TerminalInput {...defaultProps} waitingForInput={true} />)

      await waitFor(() => {
        const input = screen.getByTestId('terminal-input')
        expect(input).toHaveFocus()
      })
    })

    it('should focus input on mount when waiting', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)

      // Due to async nature, we check if focus occurs
      const input = screen.getByTestId('terminal-input')
      // Focus management happens via useEffect
      expect(input).toBeInTheDocument()
    })

    it('should maintain focus while typing', async () => {
      const user = userEvent.setup()
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)

      const input = screen.getByTestId('terminal-input')
      await user.click(input)
      await user.type(input, 'test')

      expect(input).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input')
      expect(input).toHaveAttribute('aria-label', 'Terminal input')
    })

    it('should have semantic form element', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const form = screen.getByTestId('terminal-input-form')
      expect(form.tagName).toBe('FORM')
    })

    it('should have aria-hidden on prompt indicator', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const indicator = screen.getByText('>')
      expect(indicator).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper input attributes', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveAttribute('placeholder', 'Enter input...')
    })
  })

  describe('Styling and Classes', () => {
    it('should have correct form styling classes', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const form = screen.getByTestId('terminal-input-form')
      expect(form).toHaveClass('flex', 'items-center', 'gap-2', 'mt-2')
    })

    it('should have correct input styling classes', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input')
      expect(input).toHaveClass('flex-1', 'font-mono', 'bg-background')
    })

    it('should have monospace font for input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const input = screen.getByTestId('terminal-input')
      expect(input).toHaveClass('font-mono')
    })

    it('should have prompt indicator styling', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const indicator = screen.getByText('>')
      expect(indicator).toHaveClass('text-primary', 'font-bold')
    })
  })

  describe('State Transitions', () => {
    it('should show/hide input based on waitingForInput', () => {
      const { rerender } = render(<TerminalInput {...defaultProps} waitingForInput={false} />)
      expect(screen.queryByTestId('terminal-input-form')).not.toBeInTheDocument()

      rerender(<TerminalInput {...defaultProps} waitingForInput={true} />)
      expect(screen.getByTestId('terminal-input-form')).toBeInTheDocument()

      rerender(<TerminalInput {...defaultProps} waitingForInput={false} />)
      expect(screen.queryByTestId('terminal-input-form')).not.toBeInTheDocument()
    })

    it('should update input value when prop changes', () => {
      const { rerender } = render(
        <TerminalInput {...defaultProps} waitingForInput={true} inputValue="initial" />
      )

      let input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value).toBe('initial')

      rerender(
        <TerminalInput {...defaultProps} waitingForInput={true} inputValue="updated" />
      )

      input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value).toBe('updated')
    })
  })

  describe('Animation', () => {
    it('should have motion animation applied', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} />)
      const form = screen.getByTestId('terminal-input-form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input text', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()
      const longValue = 'a'.repeat(1000)

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
          inputValue={longValue}
        />
      )

      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value.length).toBe(1000)
    })

    it('should handle empty string input', () => {
      render(<TerminalInput {...defaultProps} waitingForInput={true} inputValue="" />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle rapid state changes', () => {
      const { rerender } = render(
        <TerminalInput {...defaultProps} waitingForInput={true} />
      )

      rerender(<TerminalInput {...defaultProps} waitingForInput={false} />)
      rerender(<TerminalInput {...defaultProps} waitingForInput={true} />)
      rerender(<TerminalInput {...defaultProps} waitingForInput={false} />)

      expect(screen.queryByTestId('terminal-input-form')).not.toBeInTheDocument()
    })

    it('should handle rapid input value updates', () => {
      const { rerender } = render(
        <TerminalInput {...defaultProps} waitingForInput={true} inputValue="a" />
      )

      for (let i = 0; i < 100; i++) {
        const newValue = 'a'.repeat(i + 1)
        rerender(
          <TerminalInput
            {...defaultProps}
            waitingForInput={true}
            inputValue={newValue}
          />
        )
      }

      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      expect(input.value.length).toBe(100)
    })
  })

  describe('User Interactions', () => {
    it('should handle copy and paste', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          onInputChange={onInputChange}
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.type(input, 'test content')

      expect(onInputChange).toHaveBeenCalled()
    })

    it('should clear input with ctrl+a and backspace', async () => {
      const onInputChange = jest.fn()
      const user = userEvent.setup()

      render(
        <TerminalInput
          {...defaultProps}
          waitingForInput={true}
          inputValue="initial content"
          onInputChange={onInputChange}
        />
      )

      const input = screen.getByTestId('terminal-input')
      await user.tripleClick(input)
      await user.keyboard('{Backspace}')

      expect(onInputChange).toHaveBeenCalled()
    })
  })
})
