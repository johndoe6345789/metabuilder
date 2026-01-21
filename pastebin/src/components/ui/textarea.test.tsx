import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Textarea } from './textarea'

describe('Textarea Component', () => {
  describe('Rendering', () => {
    it('renders textarea element', () => {
      render(<Textarea />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders as HTML textarea', () => {
      const { container } = render(<Textarea />)
      expect(container.querySelector('textarea')).toBeInTheDocument()
    })
  })

  describe('Value Handling', () => {
    it('accepts and displays value prop', () => {
      render(<Textarea value="test content" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('test content')
    })

    it('handles multiline content', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      render(<Textarea value={multilineText} onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue(multilineText)
    })

    it('updates value when prop changes', () => {
      const { rerender } = render(<Textarea value="initial" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('initial')

      rerender(<Textarea value="updated" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('updated')
    })
  })

  describe('Placeholder', () => {
    it('displays placeholder text', () => {
      render(<Textarea placeholder="Enter your message..." />)
      expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument()
    })

    it('placeholder is shown when empty', () => {
      render(<Textarea placeholder="Default text" value="" onChange={() => {}} />)
      expect(screen.getByPlaceholderText('Default text')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('renders disabled textarea', () => {
      render(<Textarea disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('does not allow input when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Textarea disabled onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      try {
        await user.type(textarea, 'test')
      } catch {
        // Expected - disabled field
      }
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('User Input', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} />)

      await user.type(screen.getByRole('textbox'), 'hello')
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles multiline input', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'first line')
      await user.type(textarea, '{Enter}')
      await user.type(textarea, 'second line')
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles paste events', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Textarea onChange={handleChange} />)

      const textarea = screen.getByRole('textbox')
      await user.click(textarea)
      await user.paste('pasted content\nwith newlines')
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Textarea aria-label="Description" />)
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
    })

    it('associates with label element', () => {
      render(
        <div>
          <label htmlFor="comments">Your message:</label>
          <Textarea id="comments" />
        </div>
      )
      expect(screen.getByLabelText('Your message:')).toBeInTheDocument()
    })

    it('is keyboard focusable', async () => {
      const user = userEvent.setup()
      render(<Textarea />)

      const textarea = screen.getByRole('textbox')
      await user.tab()
      expect(textarea).toHaveFocus()
    })
  })

  describe('HTML Attributes', () => {
    it('accepts name attribute', () => {
      render(<Textarea name="message" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'message')
    })

    it('accepts id attribute', () => {
      render(<Textarea id="feedback-box" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'feedback-box')
    })

    it('accepts required attribute', () => {
      render(<Textarea required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })
  })

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      render(<Textarea className="large-textarea" />)
      expect(screen.getByRole('textbox')).toHaveClass('large-textarea')
    })
  })
})
