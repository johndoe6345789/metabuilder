import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { MoveToMenu } from './MoveToMenu'
import type { Namespace } from '@/lib/types'

jest.mock('@metabuilder/components/fakemui', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Menu: ({ open, onClose, children, onClick, 'data-testid': testId }: any) =>
    open ? (
      <div
        data-testid={testId ?? 'snippet-actions-menu-content'}
        onClick={onClick}
      >
        {children}
      </div>
    ) : null,
  MenuItem: ({
    children,
    onClick,
    disabled,
    className,
    'data-testid': testId,
    'aria-label': ariaLabel,
  }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
  Divider: () => <hr />,
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

const namespaces: Namespace[] = [
  { id: 'ns1', name: 'Work', createdAt: 1000, isDefault: false },
  { id: 'ns2', name: 'Personal', createdAt: 2000, isDefault: true },
]

describe('MoveToMenu', () => {
  const defaultProps = {
    open: true,
    anchorEl: null,
    isMoving: false,
    availableNamespaces: namespaces,
    onClose: jest.fn(),
    onMove: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders when open is true', () => {
    render(<MoveToMenu {...defaultProps} />)
    expect(
      screen.getByTestId('snippet-actions-menu-content'),
    ).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<MoveToMenu {...defaultProps} open={false} />)
    expect(
      screen.queryByTestId('snippet-actions-menu-content'),
    ).not.toBeInTheDocument()
  })

  it('renders namespace items', () => {
    render(<MoveToMenu {...defaultProps} />)
    expect(screen.getByTestId('move-to-namespace-ns1')).toBeInTheDocument()
    expect(screen.getByTestId('move-to-namespace-ns2')).toBeInTheDocument()
  })

  it('renders namespace names', () => {
    render(<MoveToMenu {...defaultProps} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
  })

  it('shows "(Default)" badge for default namespace', () => {
    render(<MoveToMenu {...defaultProps} />)
    expect(screen.getByText('(Default)')).toBeInTheDocument()
  })

  it('calls onMove and onClose when a namespace is selected', async () => {
    const user = userEvent.setup()
    render(<MoveToMenu {...defaultProps} />)
    await user.click(screen.getByTestId('move-to-namespace-ns1'))
    expect(defaultProps.onMove).toHaveBeenCalledWith('ns1')
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('renders delete button', () => {
    render(<MoveToMenu {...defaultProps} />)
    expect(screen.getByTestId('snippet-card-delete-btn')).toBeInTheDocument()
  })

  it('calls onDelete and onClose when delete is clicked', async () => {
    const user = userEvent.setup()
    render(<MoveToMenu {...defaultProps} />)
    await user.click(screen.getByTestId('snippet-card-delete-btn'))
    expect(defaultProps.onDelete).toHaveBeenCalled()
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows "No other namespaces" when availableNamespaces is empty', () => {
    render(<MoveToMenu {...defaultProps} availableNamespaces={[]} />)
    expect(screen.getByTestId('no-namespaces-item')).toBeInTheDocument()
    expect(screen.getByText('No other namespaces')).toBeInTheDocument()
  })

  it('disables namespace items when isMoving is true', () => {
    render(<MoveToMenu {...defaultProps} isMoving={true} />)
    const ns1Btn = screen.getByTestId('move-to-namespace-ns1')
    expect(ns1Btn).toBeDisabled()
  })

  it('renders the namespaces list container', () => {
    render(<MoveToMenu {...defaultProps} />)
    expect(screen.getByTestId('move-to-namespaces-list')).toBeInTheDocument()
  })
})
