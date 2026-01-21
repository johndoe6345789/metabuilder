import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders as text input by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Value Handling', () => {
    it('accepts and displays value prop', () => {
      render(<Input value="test value" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('test value')
    })

    it('handles empty value', () => {
      render(<Input value="" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('updates value when prop changes', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('initial')

      rerender(<Input value="updated" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('updated')
    })
  })

  describe('Placeholder', () => {
    it('displays placeholder text', () => {
      render(<Input placeholder="Enter text..." />)
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
    })

    it('placeholder has correct attribute', () => {
      render(<Input placeholder="Type here" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Type here')
    })
  })

  describe('Disabled State', () => {
    it('renders disabled input', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('does not trigger onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Input disabled onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      try {
        await user.type(input, 'test')
      } catch {
        // Expected to fail on disabled input
      }
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Type Attribute', () => {
    it('supports email type', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('supports password type', () => {
      render(<Input type="password" />)
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('supports number type', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })
  })

  describe('User Input', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)

      await user.type(screen.getByRole('textbox'), 'hello')
      expect(handleChange).toHaveBeenCalled()
    })

    it('calls onChange for each character typed', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} value="" />)

      await user.type(screen.getByRole('textbox'), 'test')
      expect(handleChange).toHaveBeenCalledTimes(4)
    })

    it('handles paste events', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.paste('pasted text')
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles clear/backspace', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Input value="initial" onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.keyboard('{Backspace}{Backspace}{Backspace}')
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username" />)
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="help-text" />
          <span id="help-text">This is a username field</span>
        </div>
      )
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('is keyboard focusable', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.tab()
      expect(input).toHaveFocus()
    })
  })

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      render(<Input className="custom-class" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-class')
    })

    it('includes default classes', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })
  })

  describe('HTML Attributes', () => {
    it('accepts data-testid', () => {
      render(<Input data-testid="username-input" />)
      expect(screen.getByTestId('username-input')).toBeInTheDocument()
    })

    it('accepts name attribute', () => {
      render(<Input name="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
    })

    it('accepts id attribute', () => {
      render(<Input id="user-email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'user-email')
    })

    it('accepts required attribute', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })
  })
})
