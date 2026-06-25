import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordField } from './PasswordField'

jest.mock('@metabuilder/components/m3', () => ({
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

describe('PasswordField', () => {
  const defaultProps = {
    id: 'password',
    value: '',
    showPass: false,
    testId: 'password-input',
    toggleTestId: 'toggle-password',
    autoComplete: 'current-password',
    onChange: jest.fn(),
    onToggle: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders the input element', () => {
    render(<PasswordField {...defaultProps} />)
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('input type is "password" when showPass is false', () => {
    render(<PasswordField {...defaultProps} showPass={false} />)
    expect(screen.getByTestId('password-input')).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('input type is "text" when showPass is true', () => {
    render(<PasswordField {...defaultProps} showPass={true} />)
    expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'text')
  })

  it('renders toggle button', () => {
    render(<PasswordField {...defaultProps} />)
    expect(screen.getByTestId('toggle-password')).toBeInTheDocument()
  })

  it('toggle button aria-label is "Show password" when hidden', () => {
    render(<PasswordField {...defaultProps} showPass={false} />)
    expect(screen.getByTestId('toggle-password')).toHaveAttribute(
      'aria-label',
      'Show password',
    )
  })

  it('toggle button aria-label is "Hide password" when visible', () => {
    render(<PasswordField {...defaultProps} showPass={true} />)
    expect(screen.getByTestId('toggle-password')).toHaveAttribute(
      'aria-label',
      'Hide password',
    )
  })

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup()
    render(<PasswordField {...defaultProps} />)
    await user.type(screen.getByTestId('password-input'), 'secret')
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordField {...defaultProps} />)
    await user.click(screen.getByTestId('toggle-password'))
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
  })

  it('input has the provided id', () => {
    render(<PasswordField {...defaultProps} />)
    expect(screen.getByTestId('password-input')).toHaveAttribute(
      'id',
      'password',
    )
  })

  it('input has autoComplete attribute', () => {
    render(<PasswordField {...defaultProps} autoComplete="new-password" />)
    expect(screen.getByTestId('password-input')).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  })

  it('input is required', () => {
    render(<PasswordField {...defaultProps} />)
    expect(screen.getByTestId('password-input')).toBeRequired()
  })

  it('displays the current value', () => {
    render(<PasswordField {...defaultProps} value="mypassword" />)
    const input = screen.getByTestId('password-input') as HTMLInputElement
    expect(input.value).toBe('mypassword')
  })

  it('shows visibility_off icon when showPass is true', () => {
    render(<PasswordField {...defaultProps} showPass={true} />)
    const icons = document.querySelectorAll('[data-icon]')
    expect(
      Array.from(icons).some(
        el => el.getAttribute('data-icon') === 'visibility_off',
      ),
    ).toBe(true)
  })

  it('shows visibility icon when showPass is false', () => {
    render(<PasswordField {...defaultProps} showPass={false} />)
    const icons = document.querySelectorAll('[data-icon]')
    expect(
      Array.from(icons).some(
        el => el.getAttribute('data-icon') === 'visibility',
      ),
    ).toBe(true)
  })
})
