import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewModeButton } from './ViewModeButton'

// Mock @metabuilder/components/fakemui
jest.mock('@metabuilder/components/fakemui', () => ({
  Button: ({ children, onClick, 'aria-label': ariaLabel, 'aria-pressed': ariaPressed,
    'data-testid': testId, variant, ...rest }: any) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      data-testid={testId}
      data-variant={variant}
      {...rest}
    >
      {children}
    </button>
  ),
  MaterialIcon: ({ name, 'aria-hidden': ariaHidden }: any) => (
    <span aria-hidden={ariaHidden} data-icon={name} />
  ),
}))

describe('ViewModeButton', () => {
  const defaultProps = {
    mode: 'code' as const,
    active: false,
    label: 'Code view',
    iconName: 'code',
    onClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the button with correct data-testid', () => {
    render(<ViewModeButton {...defaultProps} />)
    expect(screen.getByTestId('view-mode-code-btn')).toBeInTheDocument()
  })

  it('renders the label text', () => {
    render(<ViewModeButton {...defaultProps} />)
    expect(screen.getByText('Code view')).toBeInTheDocument()
  })

  it('renders the icon with correct name', () => {
    render(<ViewModeButton {...defaultProps} />)
    expect(screen.getByRole('button').querySelector('[data-icon="code"]')).toBeInTheDocument()
  })

  it('sets aria-label on the button', () => {
    render(<ViewModeButton {...defaultProps} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Code view')
  })

  it('sets aria-pressed to false when not active', () => {
    render(<ViewModeButton {...defaultProps} active={false} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets aria-pressed to true when active', () => {
    render(<ViewModeButton {...defaultProps} active={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('uses "filled" variant when active', () => {
    render(<ViewModeButton {...defaultProps} active={true} />)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'filled')
  })

  it('uses "text" variant when not active', () => {
    render(<ViewModeButton {...defaultProps} active={false} />)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'text')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    render(<ViewModeButton {...defaultProps} />)
    await user.click(screen.getByRole('button'))
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  it('renders with different mode', () => {
    render(<ViewModeButton {...defaultProps} mode="preview" label="Preview" iconName="preview" />)
    expect(screen.getByTestId('view-mode-preview-btn')).toBeInTheDocument()
  })
})
