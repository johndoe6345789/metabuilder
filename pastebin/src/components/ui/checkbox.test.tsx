import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox Component', () => {
  describe('Rendering', () => {
    it('renders checkbox input', () => {
      render(<Checkbox />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders with label text when provided', () => {
      render(
        <label>
          <Checkbox />
          Accept terms
        </label>
      )
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })
  })

  describe('Checked State', () => {
    it('is unchecked by default', () => {
      render(<Checkbox />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('displays checked state when provided', () => {
      render(<Checkbox checked onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('displays unchecked state explicitly', () => {
      render(<Checkbox checked={false} onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('updates checked state when prop changes', () => {
      const { rerender } = render(<Checkbox checked={false} onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()

      rerender(<Checkbox checked={true} onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })

  describe('Disabled State', () => {
    it('renders disabled checkbox', () => {
      render(<Checkbox disabled />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('does not toggle when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Checkbox disabled onChange={handleChange} checked={false} />)

      await user.click(screen.getByRole('checkbox'))
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Change Events', () => {
    it('calls onChange when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange} />)

      await user.click(screen.getByRole('checkbox'))
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('calls onChange with event object', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange} />)

      await user.click(screen.getByRole('checkbox'))
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object))
    })

    it('toggles checked state on each click', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      const { rerender } = render(<Checkbox onChange={handleChange} checked={false} />)

      await user.click(screen.getByRole('checkbox'))
      expect(handleChange).toHaveBeenCalledTimes(1)

      rerender(<Checkbox onChange={handleChange} checked={true} />)
      expect(screen.getByRole('checkbox')).toBeChecked()

      await user.click(screen.getByRole('checkbox'))
      expect(handleChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Checkbox aria-label="Remember me" />)
      expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
    })

    it('associates with label element', () => {
      render(
        <div>
          <label htmlFor="terms">
            <Checkbox id="terms" />
            I agree to terms
          </label>
        </div>
      )
      expect(screen.getByLabelText('I agree to terms')).toBeInTheDocument()
    })

    it('is keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()
      render(<Checkbox onChange={handleChange} />)

      const checkbox = screen.getByRole('checkbox')
      await user.tab()
      expect(checkbox).toHaveFocus()

      await user.keyboard(' ')
      expect(handleChange).toHaveBeenCalled()
    })

    it('supports aria-describedby', () => {
      render(
        <div>
          <Checkbox aria-describedby="help" />
          <span id="help">Check to subscribe</span>
        </div>
      )
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', 'help')
    })

    it('supports aria-required', () => {
      render(<Checkbox aria-required="true" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('HTML Attributes', () => {
    it('accepts name attribute', () => {
      render(<Checkbox name="subscribe" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'subscribe')
    })

    it('accepts id attribute', () => {
      render(<Checkbox id="accept-terms" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'accept-terms')
    })

    it('accepts data-testid', () => {
      render(<Checkbox data-testid="terms-checkbox" />)
      expect(screen.getByTestId('terms-checkbox')).toBeInTheDocument()
    })

    it('accepts value attribute', () => {
      render(<Checkbox value="on" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('value', 'on')
    })
  })

  describe('CSS Classes', () => {
    it('applies custom className to container', () => {
      const { container } = render(<Checkbox className="custom-checkbox" />)
      // The className is applied to the container/wrapper
      const wrapper = container.querySelector('.custom-checkbox')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works in a form context', () => {
      const handleSubmit = jest.fn()
      render(
        <form onSubmit={handleSubmit}>
          <label>
            <Checkbox name="agree" />
            I agree
          </label>
          <button type="submit">Submit</button>
        </form>
      )
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('works with multiple checkboxes', () => {
      render(
        <div>
          <label>
            <Checkbox name="option1" />
            Option 1
          </label>
          <label>
            <Checkbox name="option2" />
            Option 2
          </label>
        </div>
      )
      expect(screen.getAllByRole('checkbox')).toHaveLength(2)
    })
  })
})
